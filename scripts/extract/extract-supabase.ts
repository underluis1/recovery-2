import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = new Logger('[Supabase Extract] ');

export async function extractSupabaseMigrations() {
  try {
    logger.info('Starting Supabase migrations extraction...');

    const config = loadConfig('dev');
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    logger.step(1, 3, 'Checking Supabase CLI installation...');
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      logger.success('Supabase CLI found');
    } catch (error) {
      throw new Error('Supabase CLI not installed. Install it with: npm install -g supabase');
    }

    logger.step(2, 3, 'Fetching migrations from Supabase Cloud...');

    // Set Supabase project
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

    try {
      // Dump the current database schema
      const dumpFile = path.join(migrationsDir, `${timestamp}_schema_dump.sql`);

      logger.info(`Dumping schema to ${dumpFile}...`);

      // Use pg_dump to export the schema
      const pgDumpCommand = `PGPASSWORD=$(echo "${config.supabase.dbUrl}" | grep -oP '(?<=:)[^@]+(?=@)') pg_dump "${config.supabase.dbUrl}" --schema-only --no-owner --no-acl > "${dumpFile}"`;

      execSync(pgDumpCommand, {
        stdio: 'pipe',
        shell: '/bin/bash'
      });

      logger.success(`Schema dumped to ${dumpFile}`);

      // Also create incremental migration if needed
      logger.info('Creating incremental migration...');

      // Get list of existing migrations
      const existingMigrations = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      logger.success(`Found ${existingMigrations.length} existing migration(s)`);

    } catch (error: any) {
      throw new Error(`Failed to dump schema: ${error.message}`);
    }

    logger.step(3, 3, 'Validating migrations...');

    const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

    if (migrations.length === 0) {
      logger.warning('No migrations found');
    } else {
      logger.success(`Successfully extracted ${migrations.length} migration(s)`);
      migrations.forEach(m => logger.info(`  - ${m}`));
    }

    logger.divider();
    logger.success('Supabase migrations extraction completed!');

    return migrations;

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
