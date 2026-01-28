/**
 * Health Check Script
 *
 * Verifica che tutti i servizi siano raggiungibili e funzionanti
 * Usage: tsx scripts/healthcheck.ts [staging|production]
 */

import axios from 'axios';
import { execSync } from 'child_process';
import { loadConfig, Environment } from './utils/config';
import { Logger } from './utils/logger';

const logger = new Logger('[Health Check] ');

interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  message: string;
  responseTime?: number;
}

async function checkSupabaseConnection(config: any): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    // Test database connection
    execSync(
      `psql "${config.supabase.dbUrl}" -c "SELECT 1;" > /dev/null 2>&1`,
      { timeout: 5000 }
    );

    const responseTime = Date.now() - startTime;

    return {
      service: 'Supabase Database',
      status: 'healthy',
      message: 'Connection successful',
      responseTime,
    };
  } catch (error: any) {
    return {
      service: 'Supabase Database',
      status: 'unhealthy',
      message: `Connection failed: ${error.message}`,
    };
  }
}

async function checkN8nAPI(config: any): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const response = await axios.get(`${config.n8n.apiUrl}/workflows`, {
      headers: {
        'X-N8N-API-KEY': config.n8n.apiKey,
      },
      params: { limit: 1 },
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;

    return {
      service: 'n8n API',
      status: 'healthy',
      message: `Connection successful (${response.status})`,
      responseTime,
    };
  } catch (error: any) {
    return {
      service: 'n8n API',
      status: 'unhealthy',
      message: `Connection failed: ${error.message}`,
    };
  }
}

async function checkMigrationStatus(config: any): Promise<HealthStatus> {
  try {
    const result = execSync(
      `psql "${config.supabase.dbUrl}" -t -c "SELECT COUNT(*) FROM _migrations;"`,
      { encoding: 'utf-8', timeout: 5000 }
    );

    const count = parseInt(result.trim());

    return {
      service: 'Migration Tracking',
      status: 'healthy',
      message: `${count} migration(s) applied`,
    };
  } catch (error: any) {
    return {
      service: 'Migration Tracking',
      status: 'unknown',
      message: 'Migration table not found (might be first run)',
    };
  }
}

async function checkDiskSpace(): Promise<HealthStatus> {
  try {
    const result = execSync(
      `df -h / | tail -1 | awk '{print $5}' | sed 's/%//'`,
      { encoding: 'utf-8', timeout: 5000 }
    );

    const usage = parseInt(result.trim());

    if (usage > 90) {
      return {
        service: 'Disk Space',
        status: 'unhealthy',
        message: `Disk usage at ${usage}% (critical)`,
      };
    } else if (usage > 80) {
      return {
        service: 'Disk Space',
        status: 'healthy',
        message: `Disk usage at ${usage}% (warning)`,
      };
    } else {
      return {
        service: 'Disk Space',
        status: 'healthy',
        message: `Disk usage at ${usage}%`,
      };
    }
  } catch (error: any) {
    return {
      service: 'Disk Space',
      status: 'unknown',
      message: 'Unable to check disk space',
    };
  }
}

async function runHealthCheck(environment: Environment) {
  try {
    logger.info(`Running health check for ${environment.toUpperCase()}...`);
    logger.divider();

    const config = loadConfig(environment);
    const checks: Promise<HealthStatus>[] = [];

    // Queue all checks
    checks.push(checkSupabaseConnection(config));
    checks.push(checkN8nAPI(config));
    checks.push(checkMigrationStatus(config));

    // Only check disk space on server (not dev)
    if (environment !== 'dev') {
      checks.push(checkDiskSpace());
    }

    // Run all checks in parallel
    const results = await Promise.all(checks);

    // Display results
    let allHealthy = true;

    for (const result of results) {
      const icon =
        result.status === 'healthy'
          ? '✓'
          : result.status === 'unhealthy'
          ? '✗'
          : '?';

      const color =
        result.status === 'healthy'
          ? 'green'
          : result.status === 'unhealthy'
          ? 'red'
          : 'yellow';

      logger[color === 'green' ? 'success' : color === 'red' ? 'error' : 'warning'](
        `${icon} ${result.service}: ${result.message}${
          result.responseTime ? ` (${result.responseTime}ms)` : ''
        }`
      );

      if (result.status === 'unhealthy') {
        allHealthy = false;
      }
    }

    logger.divider();

    if (allHealthy) {
      logger.success('All services are healthy!');
      return true;
    } else {
      logger.error('Some services are unhealthy');
      return false;
    }
  } catch (error: any) {
    logger.error(`Health check failed: ${error.message}`);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const env = (process.argv[2] || 'staging') as Environment;

  if (!['dev', 'staging', 'production'].includes(env)) {
    console.error('Usage: tsx healthcheck.ts [dev|staging|production]');
    process.exit(1);
  }

  runHealthCheck(env)
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export { runHealthCheck };
