import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig, Environment } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = new Logger('[Supabase Deploy] ');

export async function deploySupabaseMigrations(environment: Environment) {
  try {
    logger.info(`Deploying Supabase migrations to ${environment.toUpperCase()}...`);

    const config = loadConfig(environment);
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

    // Check migrations directory
    if (!fs.existsSync(migrationsDir)) {
      logger.warning('No migrations directory found. Nothing to deploy.');
      return [];
    }

    const migrations = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (migrations.length === 0) {
      logger.warning('No migration files found. Nothing to deploy.');
      return [];
    }

    logger.step(1, 3, `Found ${migrations.length} migration file(s)`);
    migrations.forEach(m => logger.info(`  - ${m}`));

    logger.step(2, 3, 'Testing database connection...');

    try {
      // Test connection using psql
      execSync(
        `psql "${config.supabase.dbUrl}" -c "SELECT version();" > /dev/null 2>&1`,
        { stdio: 'pipe' }
      );
      logger.success('Database connection successful');
    } catch (error) {
      throw new Error('Failed to connect to database. Check SUPABASE_DB_URL');
    }

    logger.step(3, 3, 'Applying migrations...');

    // Create migrations tracking table if not exists
    const createTrackingTableSQL = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `;

    execSync(
      `psql "${config.supabase.dbUrl}" -c "${createTrackingTableSQL}"`,
      { stdio: 'pipe' }
    );

    const appliedMigrations: string[] = [];
    const skippedMigrations: string[] = [];

    for (const migration of migrations) {
      try {
        // Check if migration already applied
        const checkSQL = `SELECT name FROM _migrations WHERE name = '${migration}'`;
        const result = execSync(
          `psql "${config.supabase.dbUrl}" -t -c "${checkSQL}"`,
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
          `psql "${config.supabase.dbUrl}" -f "${migrationPath}"`,
          { stdio: 'pipe' }
        );

        // Mark as applied
        const markSQL = `INSERT INTO _migrations (name) VALUES ('${migration}')`;
        execSync(
          `psql "${config.supabase.dbUrl}" -c "${markSQL}"`,
          { stdio: 'pipe' }
        );

        logger.success(`  ✓ ${migration} applied`);
        appliedMigrations.push(migration);

      } catch (error: any) {
        logger.error(`  ✗ Failed to apply ${migration}`);
        throw new Error(`Migration failed: ${migration}\n${error.message}`);
      }
    }

    logger.divider();

    if (appliedMigrations.length > 0) {
      logger.success(`Applied ${appliedMigrations.length} migration(s)`);
    }

    if (skippedMigrations.length > 0) {
      logger.info(`Skipped ${skippedMigrations.length} migration(s) (already applied)`);
    }

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
