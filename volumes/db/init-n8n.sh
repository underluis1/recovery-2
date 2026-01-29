#!/bin/bash
# Initialize n8n database and user
# This script runs automatically when PostgreSQL container starts for the first time

set -e

# Use environment variables or defaults
N8N_DB_NAME="${N8N_DB_NAME:-n8n}"
N8N_DB_USER="${N8N_DB_USER:-n8n_user}"
N8N_DB_PASSWORD="${N8N_DB_PASSWORD:-n8n_default_password}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create n8n database if it doesn't exist
    SELECT 'CREATE DATABASE ${N8N_DB_NAME}'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${N8N_DB_NAME}')\gexec

    -- Create n8n user if it doesn't exist
    DO \$\$
    BEGIN
       IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${N8N_DB_USER}') THEN
          CREATE ROLE ${N8N_DB_USER} WITH LOGIN PASSWORD '${N8N_DB_PASSWORD}';
       END IF;
    END
    \$\$;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE ${N8N_DB_NAME} TO ${N8N_DB_USER};
EOSQL

# Connect to n8n database and grant schema privileges
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${N8N_DB_NAME}" <<-EOSQL
    GRANT ALL ON SCHEMA public TO ${N8N_DB_USER};
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${N8N_DB_USER};
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${N8N_DB_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${N8N_DB_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${N8N_DB_USER};
EOSQL

echo "n8n database and user initialized successfully"
