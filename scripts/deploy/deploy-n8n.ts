import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { loadConfig, Environment } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = new Logger('[n8n Deploy] ');

interface WorkflowFile {
  id?: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
  [key: string]: any;
}

export async function deployN8nWorkflows(environment: Environment) {
  try {
    logger.info(`Deploying n8n workflows to ${environment.toUpperCase()}...`);

    const config = loadConfig(environment);
    const workflowsDir = path.join(process.cwd(), 'n8n', 'workflows');

    // Check workflows directory
    if (!fs.existsSync(workflowsDir)) {
      logger.warning('No workflows directory found. Nothing to deploy.');
      return [];
    }

    const workflowFiles = fs.readdirSync(workflowsDir)
      .filter(f => f.endsWith('.json') && f !== 'manifest.json')
      .sort();

    if (workflowFiles.length === 0) {
      logger.warning('No workflow files found. Nothing to deploy.');
      return [];
    }

    logger.step(1, 4, `Found ${workflowFiles.length} workflow file(s)`);

    logger.step(2, 4, 'Connecting to n8n API...');

    const n8nClient = axios.create({
      baseURL: config.n8n.apiUrl,
      headers: {
        'X-N8N-API-KEY': config.n8n.apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Test connection
    try {
      await n8nClient.get('/workflows', { params: { limit: 1 } });
      logger.success('Connected to n8n API');
    } catch (error: any) {
      throw new Error(`Failed to connect to n8n: ${error.message}`);
    }

    logger.step(3, 4, 'Fetching existing workflows...');

    // Get all existing workflows
    const existingWorkflows: any[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const params: any = { limit: 100 };
      if (cursor) params.cursor = cursor;

      const response = await n8nClient.get('/workflows', { params });
      const workflows = response.data.data || response.data;
      existingWorkflows.push(...workflows);

      cursor = response.data.nextCursor;
      hasMore = !!cursor;
    }

    logger.info(`Found ${existingWorkflows.length} existing workflow(s) on server`);

    logger.step(4, 4, 'Deploying workflows...');

    const deployed: string[] = [];
    const updated: string[] = [];
    const failed: string[] = [];

    for (const filename of workflowFiles) {
      try {
        const filepath = path.join(workflowsDir, filename);
        const workflowData: WorkflowFile = JSON.parse(
          fs.readFileSync(filepath, 'utf-8')
        );

        // Extract original ID from filename or workflow data
        const match = filename.match(/_([a-zA-Z0-9]+)\.json$/);
        const originalId = match ? match[1] : workflowData.id;

        // Check if workflow exists by name
        const existing = existingWorkflows.find(
          w => w.name === workflowData.name
        );

        // Prepare workflow payload (remove id for API)
        const { id, createdAt, updatedAt, ...workflowPayload } = workflowData;

        if (existing) {
          // Update existing workflow
          logger.info(`  ↻ Updating ${workflowData.name}...`);

          await n8nClient.patch(`/workflows/${existing.id}`, workflowPayload);

          logger.success(`  ✓ ${workflowData.name} updated`);
          updated.push(filename);

        } else {
          // Create new workflow
          logger.info(`  ↻ Creating ${workflowData.name}...`);

          await n8nClient.post('/workflows', workflowPayload);

          logger.success(`  ✓ ${workflowData.name} created`);
          deployed.push(filename);
        }

      } catch (error: any) {
        logger.error(`  ✗ Failed to deploy ${filename}: ${error.message}`);
        failed.push(filename);
      }
    }

    logger.divider();

    if (deployed.length > 0) {
      logger.success(`Created ${deployed.length} new workflow(s)`);
    }

    if (updated.length > 0) {
      logger.success(`Updated ${updated.length} workflow(s)`);
    }

    if (failed.length > 0) {
      logger.error(`Failed to deploy ${failed.length} workflow(s)`);
      failed.forEach(f => logger.error(`  - ${f}`));
    }

    logger.success('n8n deployment completed!');

    return [...deployed, ...updated];

  } catch (error: any) {
    logger.error(`Deployment failed: ${error.message}`);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const env = (process.argv[2] || 'staging') as Environment;

  if (!['staging', 'production'].includes(env)) {
    console.error('Usage: tsx deploy-n8n.ts [staging|production]');
    process.exit(1);
  }

  deployN8nWorkflows(env)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
