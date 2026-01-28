/**
 * Webhook Server for Git-based Deployments
 *
 * Alternative to GitHub Actions - runs on the server and listens for webhook events
 * Usage: node webhook-server.js [staging|production]
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { Logger } from './utils/logger';

const logger = new Logger('[Webhook] ');

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || '';
const DEPLOY_BRANCH = process.env.DEPLOY_BRANCH || 'staging';

if (!SECRET) {
  logger.error('WEBHOOK_SECRET environment variable is required');
  process.exit(1);
}

function verifySignature(payload: string, signature: string): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

function deploy() {
  try {
    logger.info('Starting deployment...');

    // Pull latest changes
    logger.info('Pulling latest changes...');
    execSync(`git pull origin ${DEPLOY_BRANCH}`, { stdio: 'inherit' });

    // Install dependencies
    logger.info('Installing dependencies...');
    execSync('npm install --production', { stdio: 'inherit' });

    // Run deployment
    logger.info('Running deployment script...');
    execSync(`npm run deploy:${DEPLOY_BRANCH}`, { stdio: 'inherit' });

    logger.success('Deployment completed successfully!');
    return true;

  } catch (error: any) {
    logger.error(`Deployment failed: ${error.message}`);
    return false;
  }
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const signature = req.headers['x-hub-signature-256'] as string;

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      logger.error('Invalid webhook signature');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid signature' }));
      return;
    }

    try {
      const payload = JSON.parse(body);

      // Check if it's a push event to the correct branch
      if (payload.ref === `refs/heads/${DEPLOY_BRANCH}`) {
        logger.info(`Received push event for ${DEPLOY_BRANCH} branch`);

        // Trigger deployment asynchronously
        setImmediate(() => deploy());

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Deployment triggered'
        }));

      } else {
        logger.info(`Ignoring push to ${payload.ref}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ignored',
          message: 'Not the target branch'
        }));
      }

    } catch (error: any) {
      logger.error(`Error processing webhook: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

server.listen(PORT, () => {
  logger.success(`Webhook server listening on port ${PORT}`);
  logger.info(`Branch: ${DEPLOY_BRANCH}`);
  logger.info('Waiting for webhook events...');
});
