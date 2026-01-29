# Esempio Pratico - Come Ottenere TUTTE le Credenziali

Questa guida ti mostra ESATTAMENTE dove cliccare per ottenere ogni singola credenziale.

## 🎯 Supabase Cloud - Passo per Passo

### Step 1: Login e Seleziona Progetto

```
1. Vai su https://app.supabase.com
2. Login con il tuo account
3. Clicca sul progetto che vuoi usare
```

### Step 2: Project Reference ID

```
Nella barra URL del browser:
https://app.supabase.com/project/[QUESTO-E-IL-PROJECT-REF]

Oppure:
1. Click su "Project Settings" (icona ingranaggio in basso)
2. Tab "General"
3. Cerca "Reference ID"
4. Copia il valore

Esempio: abcdefghijklmnop
```

**Usa per:**
- `SUPABASE_PROJECT_REF=abcdefghijklmnop`

### Step 3: Transaction Pooler URL

```
1. Sidebar sinistra → "Project Settings"
2. Tab "Database"
3. Sezione "Connection string"
4. Seleziona "Connection pooling" (non "Direct connection")
5. Mode: "Transaction"
6. Copia la stringa che inizia con "postgresql://postgres..."

Formato:
postgresql://postgres.PROJECT-REF:[YOUR-PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**Sostituisci `[YOUR-PASSWORD]` con la password del database!**

**Usa per:**
- `SUPABASE_DB_URL=postgresql://postgres.PROJECT-REF:PASSWORD@...pooler.supabase.com:6543/postgres`

### Step 4: Direct Connection URL

```
1. Stessa pagina "Database"
2. Sezione "Connection string"
3. Seleziona "Direct connection"
4. Copia la stringa che inizia con "postgresql://postgres:"

Formato:
postgresql://postgres:[YOUR-PASSWORD]@db.PROJECT-REF.supabase.co:5432/postgres
```

**Sostituisci `[YOUR-PASSWORD]` con la password del database!**

**Usa per:**
- `SUPABASE_DB_DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres`

### Step 5: API URL

```
1. Sidebar sinistra → "Project Settings"
2. Tab "API"
3. Sezione "Configuration"
4. Copia "Project URL"

Formato:
https://PROJECT-REF.supabase.co
```

**Usa per:**
- `SUPABASE_API_URL=https://PROJECT-REF.supabase.co`

### Step 6: Anon Key

```
1. Stessa pagina "API"
2. Sezione "Project API keys"
3. Copia "anon public"

Inizia con: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Usa per:**
- `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 7: Service Role Key

```
1. Stessa pagina "API"
2. Sezione "Project API keys"
3. Copia "service_role secret" (click su "Reveal")

⚠️ ATTENZIONE: Questa è una chiave segreta! Non condividerla!

Inizia con: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Usa per:**
- `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 8: Access Token (per Management API)

```
1. Click sull'icona del tuo profilo (in alto a destra)
2. "Account Settings"
3. Sidebar sinistra → "Access Tokens"
4. Click "Generate new token"
5. Nome: "Deployment Script"
6. Scopes: Seleziona "All" o almeno:
   - Read projects
   - Read functions
   - Write functions
7. Click "Generate token"
8. Copia il token (inizia con "sbp_")

⚠️ ATTENZIONE: Il token viene mostrato solo una volta! Salvalo subito!
```

**Usa per:**
- `SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 9: Database Password

```
Se hai perso la password del database:

1. Project Settings → Database
2. Scroll fino a "Reset database password"
3. Inserisci nuova password
4. Click "Reset password"

⚠️ ATTENZIONE: Questo disconnetterà tutte le connessioni attive!
```

## 🎯 n8n Cloud - Passo per Passo

### Step 1: Login

```
1. Vai su https://app.n8n.cloud
2. Login con il tuo account
3. Apri il workspace che vuoi usare
```

### Step 2: API URL

```
Guarda la barra URL del browser mentre usi n8n:

Formato:
https://[YOUR-INSTANCE].app.n8n.cloud/...

Esempio:
Se vedi: https://mycompany.app.n8n.cloud/workflow/123
Allora YOUR-INSTANCE = "mycompany"

API URL diventa:
https://mycompany.app.n8n.cloud/api/v1
```

**Usa per:**
- `N8N_API_URL=https://YOUR-INSTANCE.app.n8n.cloud/api/v1`
- `N8N_WEBHOOK_URL=https://YOUR-INSTANCE.app.n8n.cloud`

### Step 3: API Key

```
1. Click sull'icona "Settings" (ingranaggio in basso a sinistra)
2. Menu laterale → "API"
3. Click "Create API Key"
4. Copia la chiave (inizia con "n8n_api_")

⚠️ ATTENZIONE: La chiave viene mostrata solo una volta! Salvala subito!

Formato:
n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Usa per:**
- `N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 📝 File .env.dev Completo - Esempio Reale

Ecco come appare il file compilato:

```bash
# DEV Environment (Cloud)
ENVIRONMENT=dev

# Supabase Cloud Configuration
SUPABASE_PROJECT_ID=my-awesome-project
SUPABASE_PROJECT_REF=abcdefghijklmnop

# Database URLs
SUPABASE_DB_URL=postgresql://postgres.abcdefghijklmnop:MyS3cr3tP@ss@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
SUPABASE_DB_DIRECT_URL=postgresql://postgres:MyS3cr3tP@ss@db.abcdefghijklmnop.supabase.co:5432/postgres

# Supabase API
SUPABASE_ACCESS_TOKEN=sbp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
SUPABASE_API_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI0ODQwMCwiZXhwIjoxOTMxODI0NDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjQ4NDAwLCJleHAiOjE5MzE4MjQ0MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# n8n Cloud Configuration
N8N_API_URL=https://mycompany.app.n8n.cloud/api/v1
N8N_API_KEY=n8n_api_9x8y7z6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p
N8N_WEBHOOK_URL=https://mycompany.app.n8n.cloud
```

## ✅ Checklist di Verifica

Prima di procedere, verifica di avere:

**Supabase:**
- [ ] `SUPABASE_PROJECT_ID` (nome leggibile)
- [ ] `SUPABASE_PROJECT_REF` (ID alfanumerico)
- [ ] `SUPABASE_DB_URL` (contiene "pooler.supabase.com:6543")
- [ ] `SUPABASE_DB_DIRECT_URL` (contiene "db.PROJECT-REF.supabase.co:5432")
- [ ] `SUPABASE_ACCESS_TOKEN` (inizia con "sbp_")
- [ ] `SUPABASE_API_URL` (inizia con "https://")
- [ ] `SUPABASE_ANON_KEY` (inizia con "eyJ")
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (inizia con "eyJ")

**n8n:**
- [ ] `N8N_API_URL` (termina con "/api/v1")
- [ ] `N8N_API_KEY` (inizia con "n8n_api_")
- [ ] `N8N_WEBHOOK_URL` (URL base senza /api/v1)

## 🧪 Test Configurazione

### Test 1: Supabase Transaction Pooler

```bash
psql "$SUPABASE_DB_URL" -c "SELECT current_database();"

# Output atteso:
# current_database
# ------------------
# postgres
```

### Test 2: Supabase Direct Connection

```bash
psql "$SUPABASE_DB_DIRECT_URL" -c "SELECT version();"

# Output atteso:
# PostgreSQL 15.x on x86_64-pc-linux-gnu...
```

### Test 3: n8n API

```bash
curl -X GET "$N8N_API_URL/workflows?limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"

# Output atteso:
# {"data":[...]}
```

### Test 4: Script di Estrazione

```bash
# Copia il template
cp config/.env.dev.example config/.env.dev

# Modifica con le tue credenziali
nano config/.env.dev

# Test
npm run extract:supabase
npm run extract:n8n

# Output atteso:
# ✓ Supabase CLI found
# ✓ Schema dumped to...
# ✓ Connected to n8n API
# ✓ Found X workflow(s)
```

## ❌ Errori Comuni

### "FATAL: password authentication failed"

**Problema:** Password errata nei connection string

**Soluzione:**
1. Verifica la password del database
2. Assicurati di sostituire `[YOUR-PASSWORD]` con la password vera
3. Se la password contiene caratteri speciali, URL-encodali:
   - `@` → `%40`
   - `#` → `%23`
   - `&` → `%26`

### "prepared transactions are not supported"

**Problema:** Stai usando Transaction Pooler per pg_dump

**Soluzione:** Usa `SUPABASE_DB_DIRECT_URL` invece di `SUPABASE_DB_URL`

### "Invalid API key"

**Problema:** n8n API key non valida o header errato

**Soluzione:**
1. Rigenera API key in n8n Settings → API
2. Verifica header: `X-N8N-API-KEY` (non `Authorization`)
3. Verifica che la chiave inizi con `n8n_api_`

### "Project not found"

**Problema:** Project Reference errato

**Soluzione:**
1. Verifica `SUPABASE_PROJECT_REF` nell'URL del browser
2. Assicurati che l'Access Token sia valido
3. Verifica che l'Access Token abbia i permessi corretti

## 💡 Pro Tips

1. **Salva le credenziali in un password manager** (1Password, Bitwarden, etc.)
2. **Non committare mai** i file `.env.*` (sono già in .gitignore)
3. **Usa variabili d'ambiente diverse** per ogni ambiente (dev/staging/prod)
4. **Rigenera le chiavi** periodicamente per sicurezza
5. **Testa sempre** con `npm run healthcheck:dev` dopo aver configurato

## 📞 Supporto

Se hai problemi:
1. Verifica questa guida passo-passo
2. Controlla `docs/SUPABASE_CONFIG.md` per dettagli tecnici
3. Verifica la sezione Troubleshooting nel README
4. Apri un issue su GitHub con i dettagli dell'errore (senza includere le credenziali!)
