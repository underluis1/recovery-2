-- Create Supabase users
-- This script runs BEFORE other init scripts to create all necessary users

\set pgpass `echo "$POSTGRES_PASSWORD"`

-- Create users if they don't exist
DO $$
BEGIN
  -- authenticator: for PostgREST API requests
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator WITH LOGIN PASSWORD :'pgpass' NOINHERIT;
  END IF;

  -- pgbouncer: for connection pooling
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pgbouncer') THEN
    CREATE ROLE pgbouncer WITH LOGIN PASSWORD :'pgpass';
  END IF;

  -- supabase_admin: main admin user for Supabase services
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin WITH LOGIN PASSWORD :'pgpass' CREATEDB CREATEROLE;
  END IF;

  -- supabase_auth_admin: for auth service
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin WITH LOGIN PASSWORD :'pgpass' CREATEROLE;
  END IF;

  -- supabase_functions_admin: for edge functions
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_functions_admin') THEN
    CREATE ROLE supabase_functions_admin WITH LOGIN PASSWORD :'pgpass';
  END IF;

  -- supabase_storage_admin: for storage service
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin WITH LOGIN PASSWORD :'pgpass';
  END IF;

  -- anon, authenticated, service_role: for Row Level Security
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END
$$;

-- Grant necessary privileges
GRANT anon, authenticated, service_role TO authenticator;
GRANT supabase_admin TO postgres;
