import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = new Logger('[n8n Extract] ');

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
  staticData: any;
  tags: any[];
  createdAt: string;
  updatedAt: string;
}

export async function extractN8nWorkflows() {
  try {
    logger.info('Starting n8n workflows extraction...');

    const config = loadConfig('dev');
    const workflowsDir = path.join(process.cwd(), 'n8n', 'workflows');

    // Ensure workflows directory exists
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    logger.step(1, 4, 'Connecting to n8n Cloud API...');

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

    logger.step(2, 4, 'Fetching workflows list...');

    let allWorkflows: N8nWorkflow[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const params: any = { limit: 100 };
      if (cursor) params.cursor = cursor;

      const response = await n8nClient.get('/workflows', { params });

      const workflows = response.data.data || response.data;
      allWorkflows = allWorkflows.concat(workflows);

      cursor = response.data.nextCursor;
      hasMore = !!cursor;
    }

    logger.success(`Found ${allWorkflows.length} workflow(s)`);

    logger.step(3, 4, 'Downloading workflows...');

    const savedWorkflows: string[] = [];

    for (const workflow of allWorkflows) {
      try {
        // Get full workflow details
        const fullWorkflow = await n8nClient.get(`/workflows/${workflow.id}`);
        const workflowData = fullWorkflow.data;

        // Sanitize filename
        const sanitizedName = workflow.name
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();

        const filename = `${sanitizedName}_${workflow.id}.json`;
        const filepath = path.join(workflowsDir, filename);

        // Save workflow
        fs.writeFileSync(
          filepath,
          JSON.stringify(workflowData, null, 2),
          'utf-8'
        );

        savedWorkflows.push(filename);
        logger.info(`  ✓ ${workflow.name} (${workflow.active ? 'active' : 'inactive'})`);

      } catch (error: any) {
        logger.error(`  ✗ Failed to save ${workflow.name}: ${error.message}`);
      }
    }

    logger.step(4, 4, 'Creating workflows manifest...');

    // Create a manifest file with metadata
    const manifest = {
      extractedAt: new Date().toISOString(),
      totalWorkflows: allWorkflows.length,
      workflows: allWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        updatedAt: w.updatedAt,
        tags: w.tags,
      })),
    };

    const manifestPath = path.join(workflowsDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    logger.success('Manifest created');

    logger.divider();
    logger.success(`Successfully extracted ${savedWorkflows.length} workflow(s)!`);

    return savedWorkflows;

  } catch (error: any) {
    logger.error(`Extraction failed: ${error.message}`);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  extractN8nWorkflows()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
