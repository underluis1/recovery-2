# Quick Start - Repository Pronta! 🚀

La tua repository per il deployment multi-ambiente di n8n e Supabase è stata creata con successo!

## ✅ Cosa è Stato Creato

### 📂 Struttura Repository
```
✓ 29 file creati
✓ 3 branch configurati (main, staging, dev)
✓ GitHub Actions configurate
✓ Script TypeScript completi
✓ Documentazione completa
```

### 🔧 Componenti Principali

**Script di Estrazione:**
- ✓ `scripts/extract/extract-supabase.ts` - Estrae migrations da cloud
- ✓ `scripts/extract/extract-n8n.ts` - Estrae workflows da cloud
- ✓ `scripts/extract/index.ts` - Orchestratore completo

**Script di Deployment:**
- ✓ `scripts/deploy/deploy-supabase.ts` - Applica migrations
- ✓ `scripts/deploy/deploy-n8n.ts` - Importa workflows
- ✓ `scripts/deploy/index.ts` - Orchestratore completo

**Utilities:**
- ✓ `scripts/utils/logger.ts` - Logging colorato
- ✓ `scripts/utils/config.ts` - Gestione configurazioni
- ✓ `scripts/healthcheck.ts` - Verifica servizi
- ✓ `scripts/webhook-server.ts` - Server webhook
- ✓ `scripts/setup-server.sh` - Setup server automatico

**GitHub Actions:**
- ✓ `.github/workflows/deploy-staging.yml`
- ✓ `.github/workflows/deploy-production.yml`

**Documentazione:**
- ✓ `README.md` - Documentazione principale
- ✓ `SETUP_GUIDE.md` - Guida setup dettagliata
- ✓ `PROJECT_STRUCTURE.md` - Struttura progetto
- ✓ `CONTRIBUTING.md` - Linee guida contribuzione
- ✓ `CHANGELOG.md` - Storia modifiche

**Configurazione:**
- ✓ File `.env.*.example` per ogni ambiente
- ✓ `docker-compose.example.yml` per self-hosted
- ✓ `Makefile` per comandi rapidi
- ✓ `package.json` con tutti gli script
- ✓ `tsconfig.json` per TypeScript

## 🎯 Prossimi Passi (in Ordine)

### 1. Pubblica su GitHub (5 minuti)

```bash
# Crea repository su GitHub
# https://github.com/new
# Nome: n8n-supabase-deployment
# Private: Sì (raccomandato)

# Aggiungi remote e pusha
git remote add origin https://github.com/TUO-USERNAME/n8n-supabase-deployment.git
git push -u origin main
git push origin dev
git push origin staging
```

### 2. Setup Locale - Configura DEV (10 minuti)

```bash
# Installa dipendenze
npm install

# Configura ambiente DEV
cp config/.env.dev.example config/.env.dev
nano config/.env.dev

# Inserisci le tue credenziali cloud:
# - SUPABASE_DB_URL (da Supabase Cloud)
# - SUPABASE_ACCESS_TOKEN (da Supabase Cloud)
# - N8N_API_URL (da n8n Cloud)
# - N8N_API_KEY (da n8n Cloud)

# Testa estrazione
npm run extract:dev
```

**Dove trovare le credenziali:**

**Supabase Cloud:**
1. https://app.supabase.com
2. Seleziona progetto → Settings → Database → Connection string
3. Settings → API → Project API keys → service_role

**n8n Cloud:**
1. https://app.n8n.cloud
2. Settings → API → Create API Key

### 3. Setup Server Staging (30 minuti)

Segui la guida dettagliata in `SETUP_GUIDE.md`, sezione "Parte 2: Setup Server Staging".

**Riassunto rapido:**
```bash
# SSH nel server staging
ssh user@staging.yourdomain.com

# Installa Docker (se necessario)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clona repository
git clone https://github.com/TUO-USERNAME/n8n-supabase-deployment.git /opt/deployments/n8n-supabase-deployment
cd /opt/deployments/n8n-supabase-deployment
git checkout staging

# Setup automatico
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh staging

# Configura Docker Compose
cp docker-compose.example.yml docker-compose.yml
cp .env.docker.example .env
nano .env  # Configura credenziali

# Avvia servizi
docker-compose up -d

# Configura deployment
cp config/.env.staging.example config/.env.staging
nano config/.env.staging  # Configura credenziali

# Test
npm run healthcheck:staging
npm run deploy:staging
```

### 4. Configura GitHub Actions (15 minuti)

```bash
# Sul server staging, genera chiave SSH
ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/github_actions_staging
cat ~/.ssh/github_actions_staging.pub >> ~/.ssh/authorized_keys

# Copia chiave privata
cat ~/.ssh/github_actions_staging
# (copia tutto, da BEGIN a END)
```

**Su GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. Aggiungi:
   - `STAGING_HOST`: staging.yourdomain.com
   - `STAGING_USER`: deploy
   - `STAGING_SSH_KEY`: [chiave privata copiata sopra]
   - `STAGING_DEPLOY_PATH`: /opt/deployments/n8n-supabase-deployment

**Test GitHub Actions:**
```bash
# Locale
git checkout staging
echo "test" >> test.txt
git add test.txt
git commit -m "test: GitHub Actions"
git push origin staging

# Vai su GitHub → Actions
# Verifica che il workflow si esegua correttamente
```

### 5. Setup Production (30 minuti)

Ripeti gli step 3 e 4 per l'ambiente production:
- Usa branch `main` invece di `staging`
- Usa secrets `PROD_*` invece di `STAGING_*`
- Usa credenziali diverse per sicurezza

### 6. Workflow Quotidiano

**Sviluppo:**
```bash
# 1. Lavora in n8n Cloud e Supabase Cloud
# 2. Estrai modifiche
npm run extract:dev

# 3. Commit
git add .
git commit -m "feat: add new workflow"
git push origin dev
```

**Deploy Staging:**
```bash
git checkout staging
git merge dev
git push origin staging
# GitHub Actions deploya automaticamente!
```

**Deploy Production:**
```bash
git checkout main
git merge staging
git push origin main
# GitHub Actions deploya automaticamente!
```

## 📚 Documentazione

| File | Descrizione |
|------|-------------|
| **README.md** | Panoramica completa del progetto |
| **SETUP_GUIDE.md** | Guida passo-passo dettagliata |
| **PROJECT_STRUCTURE.md** | Struttura e descrizione file |
| **CONTRIBUTING.md** | Come contribuire |
| **QUICK_START.md** | Questo file |

## 🎓 Comandi Utili

```bash
# Estrazione
npm run extract:dev              # Estrai tutto da DEV
npm run extract:supabase         # Solo migrations
npm run extract:n8n              # Solo workflows

# Deployment
npm run deploy:staging           # Deploy su staging
npm run deploy:prod              # Deploy su production

# Health Check
npm run healthcheck:dev          # Verifica DEV
npm run healthcheck:staging      # Verifica staging
npm run healthcheck:prod         # Verifica production

# Webhook Server (alternativa a GitHub Actions)
npm run webhook:staging          # Avvia webhook staging
npm run webhook:prod             # Avvia webhook production

# Makefile shortcuts
make help                        # Mostra tutti i comandi
make extract-dev                 # Estrai da DEV
make deploy-staging              # Deploy staging
make deploy-prod                 # Deploy production
make check                       # Verifica configurazione
```

## 🔒 Sicurezza - IMPORTANTE!

### ⚠️ Non Committare Mai:
- ❌ `config/.env.dev`
- ❌ `config/.env.staging`
- ❌ `config/.env.prod`
- ❌ `.env`
- ❌ `*.log`
- ❌ Chiavi SSH private

### ✅ Committare Solo:
- ✓ File `.example`
- ✓ File di codice (.ts, .yml, .sh)
- ✓ Documentazione (.md)
- ✓ Migrations e workflows estratti

## 🐛 Problemi Comuni

### "npm: command not found"
```bash
# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### "psql: command not found"
```bash
sudo apt install postgresql-client -y
```

### "Permission denied (publickey)"
```bash
# Genera chiave SSH
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Aggiungi a GitHub Settings → SSH keys
```

### Deployment fallisce
```bash
# Verifica logs
npm run healthcheck:staging

# Verifica configurazione
cat config/.env.staging

# Verifica servizi Docker
docker-compose ps
docker-compose logs
```

## ✨ Features Implementate

- ✅ Estrazione automatica da Supabase Cloud
- ✅ Estrazione automatica da n8n Cloud
- ✅ Deployment automatico via GitHub Actions
- ✅ Deployment alternativo via webhook
- ✅ Tracking migrations per evitare duplicati
- ✅ Health check servizi
- ✅ Logging colorato e dettagliato
- ✅ Gestione errori robusta
- ✅ Multi-environment (dev, staging, prod)
- ✅ Docker Compose per self-hosted
- ✅ Setup automatico server
- ✅ Documentazione completa

## 🚀 Features Future (TODO)

- [ ] Rollback automatico in caso di errore
- [ ] Notifiche Slack/Discord
- [ ] Backup automatico pre-deployment
- [ ] Dashboard stato deployment
- [ ] Test automatizzati
- [ ] Metrics e monitoring
- [ ] SSL/TLS automatico con Let's Encrypt

## 💡 Tips

1. **Sviluppa sempre in DEV (cloud)** prima di fare deploy
2. **Testa sempre su STAGING** prima di andare in production
3. **Usa branch separati** per ogni ambiente
4. **Fai commit frequenti** con messaggi descrittivi
5. **Verifica health check** dopo ogni deployment
6. **Mantieni backup** del database production
7. **Usa secrets** per credenziali, mai hardcodare

## 📞 Supporto

- 📖 Leggi `README.md` per overview completa
- 📖 Leggi `SETUP_GUIDE.md` per istruzioni dettagliate
- 🐛 Troubleshooting in `README.md` sezione finale
- 💬 Apri issue su GitHub per problemi
- 🤝 Contribuisci seguendo `CONTRIBUTING.md`

## 🎉 Pronto!

La tua repository è completamente configurata e pronta all'uso!

**Next Step:** Segui il punto 1 dei "Prossimi Passi" per pubblicare su GitHub.

Buon deployment! 🚀
