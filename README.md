# n8n & Supabase Multi-Environment Deployment

Sistema completo per gestire il deployment automatico di progetti n8n e Supabase su tre ambienti: DEV (cloud), STAGING (self-hosted) e PRODUCTION (self-hosted).

## 📋 Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                     DEV (Cloud)                              │
│  - n8n Cloud                                                 │
│  - Supabase Cloud                                            │
│  - Sviluppo e test                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Extract (locale)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Git Repository                              │
│  - supabase/migrations/  (SQL)                               │
│  - n8n/workflows/        (JSON)                              │
│  - Scripts di deployment                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   STAGING    │      │  PRODUCTION  │
│ (Self-hosted)│      │ (Self-hosted)│
│              │      │              │
│ Push on      │      │ Push on      │
│ 'staging'    │      │ 'main'       │
└──────────────┘      └──────────────┘
```

## 🚀 Quick Start

### 1. Setup Locale (Macchina di Sviluppo)

```bash
# Clona la repository
git clone <your-repo-url>
cd n8n-supabase-deployment

# Installa le dipendenze
npm install

# Configura l'ambiente DEV
cp config/.env.dev.example config/.env.dev
# Modifica config/.env.dev con le tue credenziali cloud

# Testa l'estrazione
npm run extract:dev
```

### 2. Setup Server Staging

```bash
# SSH nel server staging
ssh user@staging.yourdomain.com

# Clona la repository
git clone <your-repo-url> /opt/deployments/n8n-supabase
cd /opt/deployments/n8n-supabase

# Esegui lo script di setup
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh staging

# Configura l'ambiente
cp config/.env.staging.example config/.env.staging
nano config/.env.staging
# Inserisci le credenziali del server staging
```

### 3. Setup Server Production

```bash
# SSH nel server production
ssh user@prod.yourdomain.com

# Clona la repository
git clone <your-repo-url> /opt/deployments/n8n-supabase
cd /opt/deployments/n8n-supabase

# Esegui lo script di setup
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh production

# Configura l'ambiente
cp config/.env.prod.example config/.env.prod
nano config/.env.prod
# Inserisci le credenziali del server production
```

## 📁 Struttura della Repository

```
.
├── .github/
│   └── workflows/
│       ├── deploy-staging.yml      # GitHub Action per staging
│       └── deploy-production.yml   # GitHub Action per production
├── config/
│   ├── .env.dev.example           # Template configurazione DEV
│   ├── .env.staging.example       # Template configurazione STAGING
│   └── .env.prod.example          # Template configurazione PROD
├── supabase/
│   └── migrations/                # Migration SQL di Supabase
├── n8n/
│   └── workflows/                 # Workflow n8n (JSON)
├── scripts/
│   ├── extract/
│   │   ├── extract-supabase.ts   # Estrae migrations da cloud
│   │   ├── extract-n8n.ts        # Estrae workflows da cloud
│   │   └── index.ts              # Estrazione completa
│   ├── deploy/
│   │   ├── deploy-supabase.ts    # Deploy migrations
│   │   ├── deploy-n8n.ts         # Deploy workflows
│   │   └── index.ts              # Deploy completo
│   ├── utils/
│   │   ├── logger.ts             # Logging colorato
│   │   └── config.ts             # Gestione configurazioni
│   ├── setup-server.sh           # Setup iniziale server
│   └── webhook-server.ts         # Server webhook (alternativa)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Workflow di Sviluppo

### 1. Sviluppare in DEV (Cloud)

Lavora normalmente su n8n Cloud e Supabase Cloud.

### 2. Estrarre Modifiche da DEV

```bash
# Estrai tutto (migrations + workflows)
npm run extract:dev

# Oppure estrai singolarmente
npm run extract:supabase  # Solo migrations Supabase
npm run extract:n8n       # Solo workflows n8n
```

Questo comando:
- Scarica le migration SQL da Supabase Cloud
- Scarica i workflow JSON da n8n Cloud
- Salva tutto nella repository locale

### 3. Committare e Pushare

```bash
# Verifica i file estratti
git status

# Aggiungi le modifiche
git add supabase/migrations/ n8n/workflows/

# Commit
git commit -m "feat: add new workflow for email notifications"

# Push su dev branch
git push origin dev
```

### 4. Deploy su STAGING

```bash
# Merge dev -> staging
git checkout staging
git merge dev
git push origin staging
```

**GitHub Actions si attiva automaticamente** e:
1. Connette al server staging via SSH
2. Copia i file
3. Applica le migrations Supabase
4. Importa/aggiorna i workflows n8n
5. Notifica il risultato

### 5. Deploy su PRODUCTION

```bash
# Merge staging -> main (dopo test)
git checkout main
git merge staging
git push origin main
```

**GitHub Actions si attiva automaticamente** e:
1. Connette al server production via SSH
2. Copia i file
3. Applica le migrations Supabase
4. Importa/aggiorna i workflows n8n
5. Crea un tag Git per tracciamento
6. Notifica il risultato

## ⚙️ Configurazione

### Credenziali DEV (Cloud)

File: `config/.env.dev`

```bash
ENVIRONMENT=dev

# Supabase Cloud
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx
SUPABASE_API_URL=https://PROJECT-REF.supabase.co

# n8n Cloud
N8N_API_URL=https://YOUR-INSTANCE.app.n8n.cloud/api/v1
N8N_API_KEY=n8n_api_xxxxxxxxxxxxx
```

**Come ottenere le credenziali:**

**Supabase Cloud:**
1. Vai su https://app.supabase.com
2. Seleziona il tuo progetto
3. Settings → Database → Connection string (URI)
4. Settings → API → Project API keys → service_role key

**n8n Cloud:**
1. Vai su https://app.n8n.cloud
2. Settings → API
3. Crea una nuova API Key

### Credenziali STAGING/PROD (Self-hosted)

File: `config/.env.staging` o `config/.env.prod`

```bash
ENVIRONMENT=staging

# Supabase Self-hosted
SUPABASE_PROJECT_ID=staging-project
SUPABASE_DB_URL=postgresql://postgres:PASSWORD@localhost:5432/postgres
SUPABASE_ACCESS_TOKEN=your-token
SUPABASE_API_URL=http://localhost:8000

# n8n Self-hosted
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-n8n-api-key

# Server
SERVER_HOST=staging.yourdomain.com
SSH_USER=deploy
SSH_KEY_PATH=~/.ssh/id_rsa
```

**Come ottenere le credenziali:**

**n8n Self-hosted:**
```bash
# SSH nel server
ssh user@staging.yourdomain.com

# Accedi a n8n (http://localhost:5678)
# Settings → API → Generate API Key
```

### GitHub Secrets

Per GitHub Actions, configura questi secrets nella repository:

**Staging:**
- `STAGING_HOST`: hostname del server (es. staging.yourdomain.com)
- `STAGING_USER`: utente SSH (es. deploy)
- `STAGING_SSH_KEY`: chiave SSH privata
- `STAGING_DEPLOY_PATH`: path deployment (es. /opt/deployments/n8n-supabase)

**Production:**
- `PROD_HOST`: hostname del server
- `PROD_USER`: utente SSH
- `PROD_SSH_KEY`: chiave SSH privata
- `PROD_DEPLOY_PATH`: path deployment

**Come configurare:**
1. GitHub repository → Settings → Secrets and variables → Actions
2. New repository secret
3. Inserisci nome e valore
4. Ripeti per ogni secret

## 🎯 Comandi Disponibili

### Estrazione (Locale)

```bash
# Estrai tutto da DEV
npm run extract:dev

# Estrai solo Supabase
npm run extract:supabase

# Estrai solo n8n
npm run extract:n8n
```

### Deployment (Server)

```bash
# Deploy completo su staging
npm run deploy:staging

# Deploy completo su production
npm run deploy:prod

# Deploy solo Supabase
npm run deploy:supabase

# Deploy solo n8n
npm run deploy:n8n
```

### Utility

```bash
# Type checking
npm run type-check
```

## 🔄 Deployment Automatico: Due Opzioni

### Opzione 1: GitHub Actions (Raccomandato)

Deployment automatico quando fai push su `staging` o `main`.

**Pro:**
- Setup semplice
- Nessun server aggiuntivo
- Logs centralizzati su GitHub
- Integrato con GitHub

**Contro:**
- Richiede GitHub (non GitLab/Bitbucket)
- Ogni deploy consuma minuti GitHub Actions

### Opzione 2: Webhook Server

Server webhook che gira sui server staging/prod e ascolta eventi Git.

**Setup:**

```bash
# Sul server
cd /opt/deployments/n8n-supabase

# Crea file .env per webhook
cat > .env.webhook << EOF
WEBHOOK_SECRET=your-secret-key
WEBHOOK_PORT=9000
DEPLOY_BRANCH=staging
EOF

# Avvia webhook server
npm install pm2 -g
pm2 start scripts/webhook-server.ts --name webhook-deploy
pm2 save
pm2 startup
```

**Configura webhook su GitHub:**
1. Repository → Settings → Webhooks → Add webhook
2. Payload URL: `http://staging.yourdomain.com:9000`
3. Content type: `application/json`
4. Secret: `your-secret-key`
5. Events: `Just the push event`

**Pro:**
- Funziona con qualsiasi Git host
- Nessun limite di minuti
- Deployment istantaneo

**Contro:**
- Richiede porta aperta (9000)
- Server deve essere sempre online
- Setup più complesso

## 🐛 Troubleshooting

### Errore: "SUPABASE_DB_URL not found"

```bash
# Verifica che il file .env esista
ls -la config/.env.dev

# Se non esiste, copia dall'example
cp config/.env.dev.example config/.env.dev
nano config/.env.dev
```

### Errore: "Failed to connect to n8n"

Verifica che:
1. n8n sia in esecuzione: `curl http://localhost:5678/api/v1/workflows`
2. L'API key sia corretta
3. L'URL sia corretto (con `/api/v1`)

### Errore: "Migration failed"

```bash
# Verifica connessione database
psql "$SUPABASE_DB_URL" -c "SELECT version();"

# Verifica migrations
ls -la supabase/migrations/

# Controlla log
tail -f /var/log/syslog | grep deploy
```

### Deploy non si attiva su push

**GitHub Actions:**
```bash
# Verifica branch
git branch --show-current

# Verifica GitHub Actions
# GitHub → Actions → verifica workflow run
```

**Webhook:**
```bash
# Sul server, verifica che webhook server sia attivo
pm2 status

# Verifica logs
pm2 logs webhook-deploy

# Verifica porta aperta
netstat -tuln | grep 9000
```

## 🔒 Sicurezza

### Protezione Credenziali

```bash
# MAI committare file .env
echo "config/.env.*" >> .gitignore
echo "!config/.env.*.example" >> .gitignore

# Verifica
git status --ignored
```

### Limitare Accesso SSH

```bash
# Sul server, crea utente dedicato
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy  # se usi Docker

# Aggiungi chiave pubblica
sudo mkdir -p /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
# Incolla la tua chiave pubblica

# Permessi corretti
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### Firewall

```bash
# Permetti solo SSH e webhook (se usato)
sudo ufw allow 22/tcp
sudo ufw allow 9000/tcp  # solo se usi webhook
sudo ufw enable
```

## 📊 Logging e Monitoring

### Visualizzare Deployment Logs

**GitHub Actions:**
- GitHub repository → Actions → Seleziona workflow run

**Locale/Server:**
```bash
# Durante deploy
npm run deploy:staging 2>&1 | tee deploy.log

# Logs sistema
journalctl -u n8n-supabase-deploy -f
```

### Monitorare Webhook

```bash
# Con PM2
pm2 logs webhook-deploy

# Con journalctl
journalctl -f | grep webhook
```

## 🔄 Rollback

In caso di problemi dopo il deployment:

```bash
# Opzione 1: Rollback Git
git revert HEAD
git push origin staging

# Opzione 2: Reset a commit precedente
git reset --hard <commit-hash>
git push origin staging --force

# Opzione 3: Deploy tag precedente
git checkout tags/prod-20240115-120000
npm run deploy:prod
```

## 📚 Esempi Pratici

### Esempio 1: Nuovo Workflow

```bash
# 1. Crea workflow in n8n Cloud
# 2. Estrai
npm run extract:n8n

# 3. Verifica
git diff n8n/workflows/

# 4. Commit
git add n8n/workflows/
git commit -m "feat: add customer notification workflow"

# 5. Deploy staging
git push origin staging

# 6. Test su staging
# 7. Deploy production
git checkout main
git merge staging
git push origin main
```

### Esempio 2: Nuova Migration Supabase

```bash
# 1. Modifica schema in Supabase Cloud
# 2. Estrai
npm run extract:supabase

# 3. Verifica migration
cat supabase/migrations/*.sql

# 4. Commit
git add supabase/migrations/
git commit -m "feat: add users table"

# 5. Deploy staging
git push origin staging

# 6. Verifica su staging
ssh user@staging.yourdomain.com
psql $SUPABASE_DB_URL -c "\dt"

# 7. Deploy production
git checkout main
git merge staging
git push origin main
```

## 🤝 Contributing

1. Crea un branch per la feature: `git checkout -b feature/my-feature`
2. Commit: `git commit -m "feat: add feature"`
3. Push: `git push origin feature/my-feature`
4. Crea Pull Request

## 📄 License

MIT

## 💡 Supporto

Per problemi o domande:
1. Verifica questa documentazione
2. Controlla la sezione Troubleshooting
3. Apri un issue su GitHub
