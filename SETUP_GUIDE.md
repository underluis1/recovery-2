# Setup Guide Completa

Questa guida ti accompagnerà passo-passo nel setup completo del sistema di deployment.

## Prerequisiti

### Locale (macchina di sviluppo)
- [x] Node.js 20+ installato
- [x] Git installato
- [x] Account GitHub (per repository e Actions)
- [x] PostgreSQL client (psql)
- [x] Supabase CLI: `npm install -g supabase`

### Server Staging e Production
- [x] Ubuntu 24 (o compatibile)
- [x] Accesso SSH con chiave pubblica
- [x] Docker e Docker Compose (opzionale, ma raccomandato)
- [x] Porta 22 (SSH) aperta
- [x] Porta 9000 aperta (se usi webhook server)

## Parte 1: Setup Locale

### Step 1: Clona e Inizializza

```bash
# Crea repository su GitHub
# Vai su https://github.com/new
# Nome: n8n-supabase-deployment
# Visibilità: Private (raccomandato)
# Non aggiungere README, .gitignore, license

# Clona questa repository localmente
git clone https://github.com/TUO-USERNAME/n8n-supabase-deployment.git
cd n8n-supabase-deployment

# Copia tutti i file del progetto qui
# (assumendo che tu abbia già i file da questa soluzione)

# Installa dipendenze
npm install
```

### Step 2: Configura Ambiente DEV (Cloud)

```bash
# Copia il template
cp config/.env.dev.example config/.env.dev

# Modifica il file
nano config/.env.dev
```

Inserisci i tuoi dati:

**Per Supabase Cloud:**

1. Vai su https://app.supabase.com
2. Seleziona il tuo progetto
3. Settings → Database
   - Connection string → URI → Copia
   - Incolla in `SUPABASE_DB_URL`
4. Settings → API
   - Project URL → Copia
   - Incolla in `SUPABASE_API_URL`
   - service_role key → Copia
   - Incolla in `SUPABASE_ACCESS_TOKEN`
5. Project ID è nella URL: `app.supabase.com/project/[PROJECT-ID]`

**Per n8n Cloud:**

1. Vai su https://app.n8n.cloud
2. Apri il tuo workflow editor
3. Settings → API
4. Create API Key
5. Copia la chiave in `N8N_API_KEY`
6. L'URL è: `https://[tuo-instance].app.n8n.cloud/api/v1`

Esempio di configurazione completa:

```bash
ENVIRONMENT=dev

SUPABASE_PROJECT_ID=abcdefghijklmnop
SUPABASE_DB_URL=postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
SUPABASE_ACCESS_TOKEN=sbp_1234567890abcdefghijklmnopqrstuvwxyz
SUPABASE_API_URL=https://abcdefghijklmnop.supabase.co

N8N_API_URL=https://myinstance.app.n8n.cloud/api/v1
N8N_API_KEY=n8n_api_1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 3: Test Estrazione

```bash
# Test estrazione Supabase
npm run extract:supabase

# Output atteso:
# ✓ Supabase CLI found
# ✓ Schema dumped to supabase/migrations/2024-01-15_schema_dump.sql
# ✓ Successfully extracted 1 migration(s)

# Test estrazione n8n
npm run extract:n8n

# Output atteso:
# ✓ Connected to n8n API
# ✓ Found 5 workflow(s)
# ✓ Successfully extracted 5 workflow(s)!
```

### Step 4: Primo Commit

```bash
# Verifica i file estratti
ls -la supabase/migrations/
ls -la n8n/workflows/

# Aggiungi e committa
git add .
git commit -m "Initial setup with migrations and workflows"

# Crea branch dev, staging, main
git branch dev
git branch staging
git checkout -b main

# Push tutti i branch
git push -u origin main
git push -u origin dev
git push -u origin staging
```

## Parte 2: Setup Server Staging

### Step 1: Prepara Server

```bash
# SSH nel server
ssh user@staging.yourdomain.com

# Aggiorna sistema
sudo apt update && sudo apt upgrade -y

# Installa Docker (se non presente)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installa Docker Compose
sudo apt install docker-compose -y

# Logout e login per applicare gruppo docker
exit
ssh user@staging.yourdomain.com
```

### Step 2: Clona Repository

```bash
# Crea directory deployment
sudo mkdir -p /opt/deployments
sudo chown $USER:$USER /opt/deployments

# Clona repository
cd /opt/deployments
git clone https://github.com/TUO-USERNAME/n8n-supabase-deployment.git
cd n8n-supabase-deployment

# Checkout branch staging
git checkout staging
```

### Step 3: Setup n8n e Supabase con Docker

```bash
# Copia template Docker
cp docker-compose.example.yml docker-compose.yml
cp .env.docker.example .env

# Modifica configurazione Docker
nano .env
```

Configura:
```bash
POSTGRES_PASSWORD=super-secret-password-staging
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
N8N_USER=admin
N8N_PASSWORD=your-n8n-password
N8N_HOST=staging.yourdomain.com
```

```bash
# Avvia servizi
docker-compose up -d

# Verifica
docker-compose ps

# Output atteso:
# supabase-db       running
# n8n               running
# redis             running
```

### Step 4: Configura Deployment

```bash
# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installa PostgreSQL client
sudo apt install postgresql-client -y

# Installa dipendenze progetto
npm install --production

# Configura ambiente
cp config/.env.staging.example config/.env.staging
nano config/.env.staging
```

Configurazione `.env.staging`:

```bash
ENVIRONMENT=staging

SUPABASE_PROJECT_ID=staging-project
SUPABASE_DB_URL=postgresql://postgres:super-secret-password-staging@localhost:5432/postgres
SUPABASE_ACCESS_TOKEN=your-service-key
SUPABASE_API_URL=http://localhost:8000

N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=generate-this-from-n8n-ui

SERVER_HOST=staging.yourdomain.com
SSH_USER=deploy
SSH_KEY_PATH=~/.ssh/id_rsa
```

**Ottenere n8n API Key:**

```bash
# Apri browser su http://staging.yourdomain.com:5678
# Login con credenziali configurate in .env
# Settings → API → Generate API Key
# Copia la chiave nel file .env.staging
```

### Step 5: Test Deployment Manuale

```bash
# Test health check
npm run healthcheck:staging

# Output atteso:
# ✓ Supabase Database: Connection successful (150ms)
# ✓ n8n API: Connection successful (200ms)
# ✓ All services are healthy!

# Test deployment
npm run deploy:staging

# Output atteso:
# ✓ Applied 1 migration(s)
# ✓ Created 5 new workflow(s)
# ✓ Deployment to STAGING completed successfully!
```

### Step 6: Setup Chiave SSH per GitHub Actions

```bash
# Sul server staging, genera chiave dedicata
ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/github_actions_staging

# Aggiungi chiave pubblica a authorized_keys
cat ~/.ssh/github_actions_staging.pub >> ~/.ssh/authorized_keys

# Mostra chiave privata (da copiare in GitHub Secrets)
cat ~/.ssh/github_actions_staging

# Copia l'output (tutto, da BEGIN a END)
```

### Step 7: Configura GitHub Secrets

1. Vai su GitHub → Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. Aggiungi questi secrets:

```
Nome: STAGING_HOST
Valore: staging.yourdomain.com

Nome: STAGING_USER
Valore: deploy (o il tuo username)

Nome: STAGING_SSH_KEY
Valore: [incolla la chiave privata generata sopra]

Nome: STAGING_DEPLOY_PATH
Valore: /opt/deployments/n8n-supabase-deployment
```

### Step 8: Test GitHub Actions

```bash
# Sul tuo computer locale
git checkout staging

# Fai una modifica di test
echo "# Test" >> test.md
git add test.md
git commit -m "test: GitHub Actions deployment"
git push origin staging

# Vai su GitHub → Actions
# Dovresti vedere il workflow "Deploy to Staging" in esecuzione
# Attendi che finisca (circa 2-3 minuti)

# Sul server, verifica deployment
ssh user@staging.yourdomain.com
cd /opt/deployments/n8n-supabase-deployment
git log -1  # Dovrebbe mostrare il commit "test: GitHub Actions deployment"
```

## Parte 3: Setup Server Production

Ripeti tutti gli step della Parte 2, ma:
- Usa `production` invece di `staging`
- Usa branch `main` invece di `staging`
- Usa secrets `PROD_*` invece di `STAGING_*`
- Usa password e credenziali diverse

## Parte 4: Workflow Quotidiano

### Sviluppo

```bash
# 1. Lavora in n8n Cloud e Supabase Cloud

# 2. Quando hai finito, estrai le modifiche
npm run extract:dev

# 3. Verifica
git status
git diff

# 4. Commit
git add .
git commit -m "feat: add customer email workflow"

# 5. Push su dev
git push origin dev
```

### Deploy su Staging

```bash
# 1. Merge dev → staging
git checkout staging
git merge dev
git push origin staging

# 2. GitHub Actions fa il deploy automaticamente

# 3. Verifica su staging
npm run healthcheck:staging
# Oppure visita http://staging.yourdomain.com:5678
```

### Deploy su Production

```bash
# 1. Merge staging → main
git checkout main
git merge staging
git push origin main

# 2. GitHub Actions fa il deploy automaticamente

# 3. Verifica su production
npm run healthcheck:prod
```

## Parte 5: Setup Webhook Server (Alternativa a GitHub Actions)

Se preferisci non usare GitHub Actions:

### Sul Server

```bash
# Installa PM2
npm install -g pm2

# Crea file .env per webhook
cat > .env.webhook << EOF
WEBHOOK_SECRET=$(openssl rand -hex 32)
WEBHOOK_PORT=9000
DEPLOY_BRANCH=staging
EOF

# Mostra il secret generato (da usare in GitHub)
cat .env.webhook | grep WEBHOOK_SECRET

# Avvia webhook server
pm2 start scripts/webhook-server.ts --name webhook-deploy
pm2 save
pm2 startup  # Segui le istruzioni

# Verifica
pm2 status
pm2 logs webhook-deploy
```

### Su GitHub

1. Repository → Settings → Webhooks → Add webhook
2. Payload URL: `http://staging.yourdomain.com:9000`
3. Content type: `application/json`
4. Secret: [incolla WEBHOOK_SECRET]
5. Which events: `Just the push event`
6. Active: ✓
7. Add webhook

### Test

```bash
# Locale
git checkout staging
echo "test" >> test.md
git add test.md
git commit -m "test: webhook deployment"
git push origin staging

# Sul server, guarda i logs
pm2 logs webhook-deploy

# Dovresti vedere:
# Received push event for staging branch
# Starting deployment...
# Deployment completed successfully!
```

## Troubleshooting

### Problema: "Permission denied (publickey)"

```bash
# Verifica chiave SSH
ssh -T git@github.com

# Se fallisce, genera nuova chiave
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Aggiungi a GitHub Settings → SSH keys
```

### Problema: "npm: command not found"

```bash
# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Problema: "psql: command not found"

```bash
# Installa PostgreSQL client
sudo apt update
sudo apt install postgresql-client -y
```

### Problema: Docker container non si avvia

```bash
# Verifica logs
docker-compose logs

# Riavvia
docker-compose down
docker-compose up -d

# Verifica porta
netstat -tuln | grep 5432
netstat -tuln | grep 5678
```

## Prossimi Passi

1. [ ] Setup SSL/TLS con Let's Encrypt
2. [ ] Configurare backup automatici
3. [ ] Setup monitoring (Prometheus + Grafana)
4. [ ] Configurare alerting (Slack/Discord)
5. [ ] Implementare rollback automatico
6. [ ] Setup ambiente di test automatizzato

## Risorse

- [Documentazione n8n](https://docs.n8n.io)
- [Documentazione Supabase](https://supabase.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Docker Docs](https://docs.docker.com)
