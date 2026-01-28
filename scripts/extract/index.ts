import { Logger } from '../utils/logger';
import { extractSupabaseMigrations } from './extract-supabase';
import { extractN8nWorkflows } from './extract-n8n';

const logger = new Logger();

async function main() {
  try {
    logger.info('Starting extraction from DEV environment...');
    logger.divider();

    // Extract Supabase migrations
    await extractSupabaseMigrations();
    logger.divider();

    // Extract n8n workflows
    await extractN8nWorkflows();
    logger.divider();

    logger.success('All extractions completed successfully!');
    logger.info('Next steps:');
    logger.info('  1. Review the extracted files');
    logger.info('  2. Commit changes: git add . && git commit -m "Update from dev"');
    logger.info('  3. Push to trigger deployment: git push origin staging');

  } catch (error: any) {
    logger.error(`Extraction failed: ${error.message}`);
    process.exit(1);
  }
}

main();
