import { Logger } from '../utils/logger';
import { Environment } from '../utils/config';
import { deploySupabaseMigrations } from './deploy-supabase';
import { deployN8nWorkflows } from './deploy-n8n';

const logger = new Logger();

async function main() {
  const env = (process.argv[2] || 'staging') as Environment;

  if (!['staging', 'production'].includes(env)) {
    logger.error('Usage: tsx deploy/index.ts [staging|production]');
    process.exit(1);
  }

  try {
    logger.info(`Starting deployment to ${env.toUpperCase()} environment...`);
    logger.divider();

    // Deploy Supabase migrations
    logger.info('Step 1: Deploying Supabase migrations...');
    await deploySupabaseMigrations(env);
    logger.divider();

    // Deploy n8n workflows
    logger.info('Step 2: Deploying n8n workflows...');
    await deployN8nWorkflows(env);
    logger.divider();

    logger.success(`Deployment to ${env.toUpperCase()} completed successfully!`);

  } catch (error: any) {
    logger.error(`Deployment failed: ${error.message}`);
    logger.info('Rolling back changes...');
    // Add rollback logic here if needed
    process.exit(1);
  }
}

main();
