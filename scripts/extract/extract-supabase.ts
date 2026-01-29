import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { loadConfig } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = new Logger('[Supabase Extract] ');

interface EdgeFunction {
  id: string;
  slug: string;
  name: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export async function extractSupabaseMigrations() {
  try {
    logger.info('Starting Supabase extraction...');

    const config = loadConfig('dev');
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const functionsDir = path.join(process.cwd(), 'supabase', 'functions');

    // Ensure directories exist
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    if (!fs.existsSync(functionsDir)) {
      fs.mkdirSync(functionsDir, { recursive: true });
    }

    logger.step(1, 5, 'Checking dependencies...');

    // Check Supabase CLI
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      logger.success('Supabase CLI found');
    } catch (error) {
      throw new Error('Supabase CLI not installed. Install it with: npm install -g supabase');
    }

    // Check pg_dump
    try {
      execSync('pg_dump --version', { stdio: 'pipe' });
      logger.success('pg_dump found');
    } catch (error) {
      throw new Error('pg_dump not installed. Install PostgreSQL client tools.');
    }

    logger.step(2, 5, 'Extracting database schema...');

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_');

    try {
      // Use direct connection URL for pg_dump (not transaction pooler)
      const directUrl = config.supabase.dbDirectUrl;

      // Extract full schema with data types, constraints, indexes
      const schemaFile = path.join(migrationsDir, `${timestamp}_schema.sql`);

      logger.info('Dumping complete schema...');

      // Dump schema only (no data)
      execSync(
        `pg_dump "${directUrl}" \
          --schema-only \
          --no-owner \
          --no-acl \
          --clean \
          --if-exists \
          --exclude-schema=storage \
          --exclude-schema=vault \
          --exclude-schema=extensions \
          > "${schemaFile}"`,
        {
          stdio: 'pipe',
          shell: '/bin/bash'
        }
      );

      logger.success(`Schema dumped to ${path.basename(schemaFile)}`);

      // Also create a separate file for just the tables structure
      const tablesFile = path.join(migrationsDir, `${timestamp}_tables.sql`);

      execSync(
        `pg_dump "${directUrl}" \
          --schema-only \
          --no-owner \
          --no-acl \
          --table='public.*' \
          > "${tablesFile}"`,
        {
          stdio: 'pipe',
          shell: '/bin/bash'
        }
      );

      logger.success(`Tables schema dumped to ${path.basename(tablesFile)}`);

    } catch (error: any) {
      throw new Error(`Failed to dump schema: ${error.message}`);
    }

    logger.step(3, 5, 'Extracting RLS policies and triggers...');

    try {
      const policiesFile = path.join(migrationsDir, `${timestamp}_policies_triggers.sql`);

      // Extract RLS policies and triggers
      const policiesQuery = `
        -- Row Level Security Policies
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;

        -- Triggers
        SELECT
          trigger_schema,
          trigger_name,
          event_manipulation,
          event_object_table,
          action_statement
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        ORDER BY event_object_table, trigger_name;
      `;

      execSync(
        `psql "${config.supabase.dbDirectUrl}" -c "${policiesQuery.replace(/\n/g, ' ')}" > "${policiesFile}"`,
        { stdio: 'pipe' }
      );

      logger.success(`Policies and triggers extracted to ${path.basename(policiesFile)}`);

    } catch (error: any) {
      logger.warning(`Could not extract policies/triggers: ${error.message}`);
    }

    logger.step(4, 5, 'Extracting Edge Functions...');

    try {
      // Get list of edge functions via Management API
      const supabaseApi = axios.create({
        baseURL: 'https://api.supabase.com/v1',
        headers: {
          'Authorization': `Bearer ${config.supabase.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Get project functions
      const functionsResponse = await supabaseApi.get(
        `/projects/${config.supabase.projectRef}/functions`
      );

      const functions: EdgeFunction[] = functionsResponse.data || [];

      if (functions.length === 0) {
        logger.warning('No Edge Functions found');
      } else {
        logger.info(`Found ${functions.length} Edge Function(s)`);

        // Download each function
        for (const func of functions) {
          try {
            logger.info(`  Downloading ${func.slug}...`);

            // Get function details including code
            const funcDetails = await supabaseApi.get(
              `/projects/${config.supabase.projectRef}/functions/${func.id}`
            );

            // Create function directory
            const funcDir = path.join(functionsDir, func.slug);
            if (!fs.existsSync(funcDir)) {
              fs.mkdirSync(funcDir, { recursive: true });
            }

            // Save function code
            const codeFile = path.join(funcDir, 'index.ts');
            fs.writeFileSync(
              codeFile,
              funcDetails.data.body || '',
              'utf-8'
            );

            // Save metadata
            const metadata = {
              id: func.id,
              name: func.name,
              slug: func.slug,
              status: func.status,
              version: func.version,
              created_at: func.created_at,
              updated_at: func.updated_at,
              import_map: funcDetails.data.import_map,
              verify_jwt: funcDetails.data.verify_jwt,
            };

            const metadataFile = path.join(funcDir, 'metadata.json');
            fs.writeFileSync(
              metadataFile,
              JSON.stringify(metadata, null, 2),
              'utf-8'
            );

            logger.success(`  ✓ ${func.slug}`);

          } catch (error: any) {
            logger.error(`  ✗ Failed to download ${func.slug}: ${error.message}`);
          }
        }

        // Create functions manifest
        const manifest = {
          extractedAt: new Date().toISOString(),
          totalFunctions: functions.length,
          functions: functions.map(f => ({
            id: f.id,
            slug: f.slug,
            name: f.name,
            status: f.status,
            version: f.version,
          })),
        };

        const manifestPath = path.join(functionsDir, 'manifest.json');
        fs.writeFileSync(
          manifestPath,
          JSON.stringify(manifest, null, 2),
          'utf-8'
        );

        logger.success(`Edge Functions manifest created`);
      }

    } catch (error: any) {
      // Edge functions might not be available in all plans
      logger.warning(`Could not extract Edge Functions: ${error.message}`);
      logger.info('This might be because Edge Functions are not available in your plan');
    }

    logger.step(5, 5, 'Validating extraction...');

    const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const functionsCount = fs.readdirSync(functionsDir).filter(
      f => fs.statSync(path.join(functionsDir, f)).isDirectory()
    ).length;

    logger.success(`Extracted ${migrations.length} migration file(s)`);
    logger.success(`Extracted ${functionsCount} Edge Function(s)`);

    migrations.forEach(m => logger.info(`  - ${m}`));

    logger.divider();
    logger.success('Supabase extraction completed!');

    return { migrations, functionsCount };

  } catch (error: any) {
    logger.error(`Extraction failed: ${error.message}`);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  extractSupabaseMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
