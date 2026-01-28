import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export type Environment = 'dev' | 'staging' | 'production';

export interface Config {
  environment: Environment;
  supabase: {
    projectId: string;
    dbUrl: string;
    accessToken: string;
    apiUrl: string;
  };
  n8n: {
    apiUrl: string;
    apiKey: string;
  };
  server?: {
    host: string;
    sshUser: string;
    sshKeyPath: string;
  };
}

export function loadConfig(env: Environment): Config {
  const envFile = path.join(process.cwd(), 'config', `.env.${env}`);

  if (!fs.existsSync(envFile)) {
    throw new Error(
      `Configuration file not found: ${envFile}\n` +
      `Please copy config/.env.${env}.example to config/.env.${env} and configure it.`
    );
  }

  const result = dotenv.config({ path: envFile });

  if (result.error) {
    throw new Error(`Error loading config: ${result.error.message}`);
  }

  const config: Config = {
    environment: env,
    supabase: {
      projectId: process.env.SUPABASE_PROJECT_ID || '',
      dbUrl: process.env.SUPABASE_DB_URL || '',
      accessToken: process.env.SUPABASE_ACCESS_TOKEN || '',
      apiUrl: process.env.SUPABASE_API_URL || '',
    },
    n8n: {
      apiUrl: process.env.N8N_API_URL || '',
      apiKey: process.env.N8N_API_KEY || '',
    },
  };

  // Add server config for staging/production
  if (env !== 'dev') {
    config.server = {
      host: process.env.SERVER_HOST || '',
      sshUser: process.env.SSH_USER || '',
      sshKeyPath: process.env.SSH_KEY_PATH || '',
    };
  }

  // Validate required fields
  validateConfig(config);

  return config;
}

function validateConfig(config: Config) {
  const errors: string[] = [];

  if (!config.supabase.projectId) errors.push('SUPABASE_PROJECT_ID');
  if (!config.supabase.dbUrl) errors.push('SUPABASE_DB_URL');
  if (!config.n8n.apiUrl) errors.push('N8N_API_URL');
  if (!config.n8n.apiKey) errors.push('N8N_API_KEY');

  if (config.server) {
    if (!config.server.host) errors.push('SERVER_HOST');
    if (!config.server.sshUser) errors.push('SSH_USER');
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing required configuration:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}
