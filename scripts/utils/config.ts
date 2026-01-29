import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export type Environment = 'dev' | 'staging' | 'production';

export interface Config {
  environment: Environment;
  supabase: {
    projectId: string;
    projectRef: string;
    dbUrl: string;              // Transaction Pooler URL (port 6543)
    dbDirectUrl: string;        // Direct connection URL (port 5432) - per pg_dump
    accessToken: string;
    apiUrl: string;
    anonKey?: string;
    serviceRoleKey?: string;
  };
  n8n: {
    apiUrl: string;
    apiKey: string;
    webhookUrl?: string;
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
      projectRef: process.env.SUPABASE_PROJECT_REF || '',
      dbUrl: process.env.SUPABASE_DB_URL || '',
      dbDirectUrl: process.env.SUPABASE_DB_DIRECT_URL || process.env.SUPABASE_DB_URL || '',
      accessToken: process.env.SUPABASE_ACCESS_TOKEN || '',
      apiUrl: process.env.SUPABASE_API_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    n8n: {
      apiUrl: process.env.N8N_API_URL || '',
      apiKey: process.env.N8N_API_KEY || '',
      webhookUrl: process.env.N8N_WEBHOOK_URL,
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
  if (!config.supabase.dbDirectUrl) errors.push('SUPABASE_DB_DIRECT_URL');
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
