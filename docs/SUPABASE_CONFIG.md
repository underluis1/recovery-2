# Configurazione Supabase - Guida Completa

## Transaction Pooler vs Direct Connection

Supabase offre due tipi di connessione al database:

### 🔄 Transaction Pooler (Porta 6543)

**Quando usare:**
- Applicazioni in production
- Connessioni da serverless functions
- n8n workflows
- Quando hai molte connessioni concorrenti

**Vantaggi:**
- Gestisce efficentemente migliaia di connessioni
- Pooling automatico delle connessioni
- Migliori performance per carichi elevati

**Limitazioni:**
- Non supporta alcune funzionalità PostgreSQL avanzate
- Non adatto per migrazioni schema
- Non adatto per pg_dump/pg_restore

**URL Format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 🔗 Direct Connection (Porta 5432)

**Quando usare:**
- Estrarre schema database (pg_dump)
- Applicare migrations
- Operazioni DDL (CREATE TABLE, ALTER, DROP)
- Tool di sviluppo locale

**Vantaggi:**
- Supporto completo PostgreSQL
- Adatto per schema management
- Necessario per pg_dump

**Limitazioni:**
- Numero limitato di connessioni dirette
- Non adatto per production scaling

**URL Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## 📋 Come Ottenere le Credenziali

### Supabase Cloud

1. **Vai su** https://app.supabase.com
2. **Seleziona** il tuo progetto
3. **Project Settings** → **Database**

#### Transaction Pooler URL
1. Connection string → **Transaction**
2. Mode: **Transaction**
3. Copia la stringa di connessione

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

#### Direct Connection URL
1. Connection string → **Session**
2. Copia la stringa di connessione

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Altri Parametri

**Project Reference:**
- Nella URL del browser: `app.supabase.com/project/[PROJECT-REF]`
- Oppure in Project Settings → General → Reference ID

**API URL:**
- Project Settings → API → Project URL
- Esempio: `https://abcdefghijklmnop.supabase.co`

**Access Token (Management API):**
- Account Settings (icona profilo) → Access Tokens
- Generate new token con scope `all`

**Anon Key:**
- Project Settings → API → Project API keys → `anon` `public`

**Service Role Key:**
- Project Settings → API → Project API keys → `service_role` (⚠️ Secret!)

### Configurazione File .env.dev

```bash
ENVIRONMENT=dev

# Project Info
SUPABASE_PROJECT_ID=my-project
SUPABASE_PROJECT_REF=abcdefghijklmnop

# Database URLs
SUPABASE_DB_URL=postgresql://postgres.abcdefghijklmnop:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
SUPABASE_DB_DIRECT_URL=postgresql://postgres:PASSWORD@db.abcdefghijklmnop.supabase.co:5432/postgres

# API
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_API_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n
N8N_API_URL=https://your-instance.app.n8n.cloud/api/v1
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud
```

## 🔐 n8n API Key Configuration

### n8n Cloud

1. **Vai su** https://app.n8n.cloud
2. **Settings** (ingranaggio in basso a sinistra)
3. **API** → **Create API Key**
4. **Copia** la chiave (inizia con `n8n_api_`)
5. **Incolla** in `N8N_API_KEY`

**API URL Format:**
```
https://[YOUR-INSTANCE].app.n8n.cloud/api/v1
```

Dove `[YOUR-INSTANCE]` è visibile nella URL quando usi n8n.

### n8n Self-hosted

1. **Accedi** a n8n (http://localhost:5678 o il tuo dominio)
2. **Settings** → **API**
3. **Generate API Key**
4. **Copia** e incolla in `.env.staging` o `.env.prod`

**API URL Format:**
```
http://localhost:5678/api/v1
# oppure
https://n8n.yourdomain.com/api/v1
```

## 🛠️ Uso delle Connessioni negli Script

### Script di Estrazione (extract-supabase.ts)

**Usa:**
- ✅ `SUPABASE_DB_DIRECT_URL` per `pg_dump`
- ✅ `SUPABASE_ACCESS_TOKEN` per Management API (Edge Functions)

**Perché:**
- pg_dump richiede connessione diretta
- Management API richiede access token per scaricare edge functions

### Script di Deployment (deploy-supabase.ts)

**Usa:**
- ✅ `SUPABASE_DB_DIRECT_URL` per applicare migrations
- ✅ `SUPABASE_DB_URL` (Transaction Pooler) per verifiche
- ✅ Supabase CLI per deployare Edge Functions

**Perché:**
- Migrations (DDL) richiedono connessione diretta
- Verifiche possono usare transaction pooler
- Edge Functions deployate via CLI

### n8n Scripts (extract-n8n.ts, deploy-n8n.ts)

**Usa:**
- ✅ `N8N_API_KEY` per autenticazione
- ✅ `N8N_API_URL` per API calls

**Formato Header:**
```typescript
headers: {
  'X-N8N-API-KEY': config.n8n.apiKey,
  'Content-Type': 'application/json',
}
```

## ⚠️ Sicurezza

### Non Committare Mai

❌ File `.env.*` (senza .example)
❌ API Keys
❌ Passwords
❌ Service Role Keys

### Permessi GitHub Secrets

Quando configuri GitHub Actions, usa questi secrets:

**Per DEV (locale):**
- File: `config/.env.dev` (non committato)

**Per STAGING/PROD (GitHub Secrets):**
- `STAGING_SUPABASE_DB_URL`
- `STAGING_SUPABASE_DB_DIRECT_URL`
- `STAGING_N8N_API_KEY`
- (Ripeti per PROD)

## 🧪 Test Configurazione

### Test Supabase Connection

```bash
# Test Transaction Pooler
psql "postgresql://postgres.PROJECT-REF:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -c "SELECT version();"

# Test Direct Connection
psql "postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres" -c "SELECT version();"
```

### Test n8n API

```bash
# Test API Key
curl -X GET "https://YOUR-INSTANCE.app.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: n8n_api_xxxxxxxx"

# Risposta attesa: { "data": [...] }
```

### Test con Script

```bash
# Test estrazione
npm run extract:supabase
npm run extract:n8n

# Test health check
npm run healthcheck:dev
```

## 🔄 Migration dalla Configurazione Vecchia

Se hai già una configurazione con solo `SUPABASE_DB_URL`:

**Prima (vecchio):**
```bash
SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
```

**Dopo (nuovo):**
```bash
# Transaction Pooler (per applicazioni)
SUPABASE_DB_URL=postgresql://postgres.PROJECT-REF:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Direct Connection (per migrations)
SUPABASE_DB_DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
```

## 📚 Risorse

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supabase Management API](https://supabase.com/docs/reference/api/introduction)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [Edge Functions](https://supabase.com/docs/guides/functions)

## ❓ FAQ

**Q: Quale URL devo usare in n8n workflows?**
A: Usa il Transaction Pooler URL (porta 6543)

**Q: pg_dump fallisce con "prepared transactions not supported"?**
A: Stai usando il Transaction Pooler. Usa Direct Connection URL.

**Q: Posso usare solo Direct Connection per tutto?**
A: Funziona, ma hai limiti di connessioni concorrenti. Usa Transaction Pooler in production.

**Q: Come ottengo l'Access Token per Edge Functions?**
A: Account Settings → Access Tokens → Generate new token

**Q: n8n API key non funziona?**
A: Verifica che l'URL includa `/api/v1` e che l'header sia `X-N8N-API-KEY`
