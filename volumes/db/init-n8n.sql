-- Create n8n database and user
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create n8n database
SELECT 'CREATE DATABASE n8n'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec

-- Create n8n user (use the password from N8N_DB_PASSWORD env var)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'n8n_user'
   ) THEN
      CREATE ROLE n8n_user WITH LOGIN PASSWORD 'n8n_default_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;

-- Connect to n8n database and grant schema privileges
\c n8n
GRANT ALL ON SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO n8n_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO n8n_user;
