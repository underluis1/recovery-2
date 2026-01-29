import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { loadConfig, Environment } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = new Logger('[Supabase Deploy] ');

interface EdgeFunctionMetadata {
  id?: string;
  name: string;
  slug: string;
  import_map?: boolean;
  verify_jwt?: boolean;
}

export async function deploySupabaseMigrations(environment: Environment) {
  try {
    logger.info(`Deploying Supabase to ${environment.toUpperCase()}...`);

    const config = loadConfig(environment);
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const functionsDir = path.join(process.cwd(), 'supabase', 'functions');

    // === PART 1: Deploy Migrations ===

    logger.step(1, 4, 'Deploying database migrations...');

    // Check migrations directory
    if (!fs.existsSync(migrationsDir)) {
      logger.warning('No migrations directory found.');
    } else {
      const migrations = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql') && !f.includes('policies_triggers'))
        .sort();

      if (migrations.length === 0) {
        logger.warning('No migration files found.');
      } else {
        logger.info(`Found ${migrations.length} migration file(s)`);

        // Test database connection using Transaction Pooler
        logger.info('Testing database connection...');
        try {
          execSync(
            `psql "${config.supabase.dbUrl}" -c "SELECT version();" > /dev/null 2>&1`,
            { stdio: 'pipe' }
          );
          logger.success('Database connection successful (Transaction Pooler)');
        } catch (error) {
          // Try direct connection as fallback
          try {
            execSync(
              `psql "${config.supabase.dbDirectUrl}" -c "SELECT version();" > /dev/null 2>&1`,
              { stdio: 'pipe' }
            );
            logger.success('Database connection successful (Direct)');
          } catch (error2) {
            throw new Error('Failed to connect to database. Check DB URLs');
          }
        }

        // Create migrations tracking table if not exists
        const createTrackingTableSQL = `
          CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP DEFAULT NOW()
          );
        `;

        // Use direct URL for schema changes (Transaction Pooler has limitations)
        const dbUrl = config.supabase.dbDirectUrl;

        execSync(
          `psql "${dbUrl}" -c "${createTrackingTableSQL}"`,
          { stdio: 'pipe' }
        );

        const appliedMigrations: string[] = [];
        const skippedMigrations: string[] = [];

        for (const migration of migrations) {
          try {
            // Check if migration already applied
            const checkSQL = `SELECT name FROM _migrations WHERE name = '${migration}'`;
            const result = execSync(
              `psql "${dbUrl}" -t -c "${checkSQL}"`,
              { encoding: 'utf-8' }
            );

            if (result.trim()) {
              logger.info(`  ⊘ ${migration} (already applied)`);
              skippedMigrations.push(migration);
              continue;
            }

            // Apply migration
            const migrationPath = path.join(migrationsDir, migration);
            logger.info(`  ↻ Applying ${migration}...`);

            execSync(
              `psql "${dbUrl}" -f "${migrationPath}"`,
              { stdio: 'pipe' }
            );

            // Mark as applied
            const markSQL = `INSERT INTO _migrations (name) VALUES ('${migration}')`;
            execSync(
              `psql "${dbUrl}" -c "${markSQL}"`,
              { stdio: 'pipe' }
            );

            logger.success(`  ✓ ${migration} applied`);
            appliedMigrations.push(migration);

          } catch (error: any) {
            logger.error(`  ✗ Failed to apply ${migration}`);
            throw new Error(`Migration failed: ${migration}\n${error.message}`);
          }
        }

        if (appliedMigrations.length > 0) {
          logger.success(`Applied ${appliedMigrations.length} migration(s)`);
        }

        if (skippedMigrations.length > 0) {
          logger.info(`Skipped ${skippedMigrations.length} migration(s) (already applied)`);
        }
      }
    }

    // === PART 2: Deploy Edge Functions ===

    logger.step(2, 4, 'Deploying Edge Functions...');

    if (!fs.existsSync(functionsDir)) {
      logger.warning('No functions directory found.');
    } else {
      const functionDirs = fs.readdirSync(functionsDir).filter(
        f => {
          const fullPath = path.join(functionsDir, f);
          return fs.statSync(fullPath).isDirectory() && f !== 'node_modules';
        }
      );

      if (functionDirs.length === 0) {
        logger.warning('No Edge Functions found.');
      } else {
        logger.info(`Found ${functionDirs.length} Edge Function(s)`);

        // Check if Supabase CLI supports functions
        try {
          execSync('supabase functions --help', { stdio: 'pipe' });
        } catch (error) {
          logger.warning('Supabase CLI does not support functions deployment');
          logger.info('Skipping Edge Functions deployment');
          logger.divider();
          logger.success('Database deployment completed!');
          return appliedMigrations;
        }

        // Deploy each function
        for (const funcName of functionDirs) {
          if (funcName === 'manifest.json') continue;

          try {
            const funcPath = path.join(functionsDir, funcName);
            const indexFile = path.join(funcPath, 'index.ts');

            if (!fs.existsSync(indexFile)) {
              logger.warning(`  ⊘ ${funcName} (no index.ts found)`);
              continue;
            }

            logger.info(`  ↻ Deploying ${funcName}...`);

            // Deploy function using Supabase CLI
            // Note: This requires supabase login and project linking
            execSync(
              `supabase functions deploy ${funcName} --project-ref ${config.supabase.projectRef}`,
              {
                stdio: 'pipe',
                cwd: path.join(process.cwd(), 'supabase')
              }
            );

            logger.success(`  ✓ ${funcName} deployed`);

          } catch (error: any) {
            logger.error(`  ✗ Failed to deploy ${funcName}: ${error.message}`);
            // Don't fail entire deployment for edge functions
          }
        }

        logger.success('Edge Functions deployment completed');
      }
    }

    logger.step(3, 4, 'Applying RLS policies and triggers...');

    // Apply policies and triggers if file exists
    const policiesFiles = fs.existsSync(migrationsDir)
      ? fs.readdirSync(migrationsDir).filter(f => f.includes('policies_triggers'))
      : [];

    if (policiesFiles.length > 0) {
      const policiesFile = path.join(migrationsDir, policiesFiles[policiesFiles.length - 1]);

      try {
        logger.info('Applying RLS policies and triggers...');

        execSync(
          `psql "${config.supabase.dbDirectUrl}" -f "${policiesFile}"`,
          { stdio: 'pipe' }
        );

        logger.success('RLS policies and triggers applied');
      } catch (error: any) {
        logger.warning(`Could not apply policies/triggers: ${error.message}`);
      }
    }

    logger.step(4, 4, 'Verification...');

    // Verify deployment
    try {
      const tableCount = execSync(
        `psql "${config.supabase.dbUrl}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`,
        { encoding: 'utf-8' }
      );

      logger.success(`Database has ${tableCount.trim()} public table(s)`);
    } catch (error) {
      logger.warning('Could not verify table count');
    }

    logger.divider();
    logger.success('Supabase deployment completed!');

    return appliedMigrations;

  } catch (error: any) {
    logger.error(`Deployment failed: ${error.message}`);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const env = (process.argv[2] || 'staging') as Environment;

  if (!['staging', 'production'].includes(env)) {
    console.error('Usage: tsx deploy-supabase.ts [staging|production]');
    process.exit(1);
  }

  deploySupabaseMigrations(env)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
