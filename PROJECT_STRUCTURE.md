# Struttura del Progetto

Panoramica completa della struttura del progetto e dello scopo di ogni file.

```
n8n-supabase-deployment/
│
├── .github/
│   └── workflows/
│       ├── deploy-staging.yml          # GitHub Action per auto-deploy su staging
│       └── deploy-production.yml       # GitHub Action per auto-deploy su production
│
├── config/
│   ├── .env.dev.example               # Template configurazione ambiente DEV (cloud)
│   ├── .env.staging.example           # Template configurazione ambiente STAGING
│   └── .env.prod.example              # Template configurazione ambiente PRODUCTION
│
├── supabase/
│   └── migrations/
│       ├── .gitkeep                   # Placeholder per Git
│       └── YYYY-MM-DD_*.sql           # Migration SQL estratte (create automaticamente)
│
├── n8n/
│   └── workflows/
│       ├── .gitkeep                   # Placeholder per Git
│       ├── *.json                     # Workflow n8n estratti (creati automaticamente)
│       └── manifest.json              # Metadata workflows (creato automaticamente)
│
├── scripts/
│   ├── extract/
│   │   ├── extract-supabase.ts       # Estrae migrations da Supabase Cloud
│   │   ├── extract-n8n.ts            # Estrae workflows da n8n Cloud
│   │   └── index.ts                  # Orchestratore estrazione completa
│   │
│   ├── deploy/
│   │   ├── deploy-supabase.ts        # Applica migrations su server
│   │   ├── deploy-n8n.ts             # Importa workflows su server
│   │   └── index.ts                  # Orchestratore deployment completo
│   │
│   ├── utils/
│   │   ├── logger.ts                 # Utility per logging colorato
│   │   └── config.ts                 # Gestione configurazioni ambiente
│   │
│   ├── setup-server.sh               # Setup automatico server staging/prod
│   ├── webhook-server.ts             # Server webhook (alternativa a GitHub Actions)
│   └── healthcheck.ts                # Verifica stato servizi
│
├── .env.docker.example                # Template variabili Docker Compose
├── .gitignore                         # File da escludere da Git
├── CHANGELOG.md                       # Storia modifiche progetto
├── CONTRIBUTING.md                    # Linee guida per contribuire
├── docker-compose.example.yml         # Template Docker per ambienti self-hosted
├── Makefile                          # Comandi Make per task comuni
├── package.json                      # Dipendenze e script npm
├── PROJECT_STRUCTURE.md              # Questo file
├── README.md                         # Documentazione principale
├── SETUP_GUIDE.md                    # Guida setup passo-passo
└── tsconfig.json                     # Configurazione TypeScript
```

## Descrizione File Principali

### File di Configurazione

**`.env.*.example`**
- Template per file di configurazione ambiente
- Copiare e rinominare in `.env.*` (senza .example)
- Contenere credenziali e URL per ogni ambiente
- Non committare mai i file `.env.*` (sono in .gitignore)

**`package.json`**
- Gestisce dipendenze npm
- Definisce script per extraction e deployment
- Versione del progetto

**`tsconfig.json`**
- Configurazione compilatore TypeScript
- Strict mode abilitato per sicurezza

**`docker-compose.example.yml`**
- Template Docker Compose per self-hosted
- Include: PostgreSQL, n8n, Supabase Studio, Redis
- Copiare come `docker-compose.yml` e configurare

### Script di Estrazione

**`scripts/extract/extract-supabase.ts`**
- Si connette a Supabase Cloud
- Usa `pg_dump` per esportare schema database
- Salva migration SQL in `supabase/migrations/`
- Traccia migrations già esistenti

**`scripts/extract/extract-n8n.ts`**
- Si connette a n8n Cloud API
- Scarica tutti i workflows (JSON)
- Salva in `n8n/workflows/`
- Crea manifest con metadata

**`scripts/extract/index.ts`**
- Orchestratore che esegue entrambe le estrazioni
- Gestisce errori e logging
- Entry point: `npm run extract:dev`

### Script di Deployment

**`scripts/deploy/deploy-supabase.ts`**
- Applica migrations SQL al database
- Usa tabella `_migrations` per tracking
- Previene ri-applicazione migrations già eseguite
- Gestione errori e rollback

**`scripts/deploy/deploy-n8n.ts`**
- Importa workflows via n8n API
- Crea nuovi workflows se non esistono
- Aggiorna workflows esistenti (match per nome)
- Preserva ID originali quando possibile

**`scripts/deploy/index.ts`**
- Orchestratore deployment completo
- Esegue prima Supabase, poi n8n
- Entry point: `npm run deploy:staging` o `npm run deploy:prod`

### Utilities

**`scripts/utils/logger.ts`**
- Logging colorato con chalk
- Livelli: info, success, error, warning
- Progress indicator per step

**`scripts/utils/config.ts`**
- Carica configurazioni da `.env.*`
- Valida campi obbligatori
- Gestisce diversi ambienti (dev/staging/prod)

**`scripts/healthcheck.ts`**
- Verifica connettività Supabase e n8n
- Controlla stato migrations
- Verifica spazio disco (su server)
- Entry point: `npm run healthcheck:staging`

**`scripts/webhook-server.ts`**
- Server HTTP per ricevere webhook GitHub
- Valida signature per sicurezza
- Triggera deployment automatico al push
- Alternativa a GitHub Actions

**`scripts/setup-server.sh`**
- Setup automatico server staging/prod
- Installa dipendenze (Node.js, PostgreSQL, Supabase CLI)
- Configura Git hooks
- Crea systemd service

### GitHub Actions

**`.github/workflows/deploy-staging.yml`**
- Triggering: push su branch `staging`
- Connette via SSH al server staging
- Copia file con rsync
- Esegue `npm run deploy:staging` sul server
- Notifica risultato

**`.github/workflows/deploy-production.yml`**
- Triggering: push su branch `main` o `prod`
- Richiede approvazione (environment protection)
- Connette via SSH al server production
- Copia file con rsync
- Esegue `npm run deploy:prod` sul server
- Crea Git tag per tracciamento
- Notifica risultato

### Documentazione

**`README.md`**
- Overview del progetto
- Architettura e workflow
- Quick start guide
- Comandi disponibili
- Troubleshooting

**`SETUP_GUIDE.md`**
- Guida dettagliata passo-passo
- Setup locale, staging, production
- Configurazione GitHub Secrets
- Setup webhook server
- Troubleshooting dettagliato

**`CONTRIBUTING.md`**
- Linee guida per contribuire
- Convenzioni commit
- Stile codice
- Processo review

**`CHANGELOG.md`**
- Storia modifiche progetto
- Formato Keep a Changelog
- Semantic versioning

**`PROJECT_STRUCTURE.md`**
- Questo file
- Panoramica struttura progetto
- Descrizione ogni file e directory

### Altri File

**`Makefile`**
- Shortcut per comandi comuni
- `make help` mostra tutti i comandi
- `make extract-dev`, `make deploy-staging`, etc.

**`.gitignore`**
- Esclude file sensibili e temporanei
- node_modules, .env, logs, etc.

## Flusso dei Dati

```
┌─────────────┐
│  DEV Cloud  │  (n8n Cloud + Supabase Cloud)
└──────┬──────┘
       │
       │ npm run extract:dev
       ▼
┌─────────────────────────────┐
│  Local Repository           │
│  - supabase/migrations/     │
│  - n8n/workflows/           │
└──────┬──────────────────────┘
       │
       │ git push origin staging
       ▼
┌─────────────────────────────┐
│  GitHub                     │
│  - Triggers workflow        │
└──────┬──────────────────────┘
       │
       │ GitHub Action / Webhook
       ▼
┌─────────────────────────────┐
│  Server (Staging/Prod)      │
│  1. git pull                │
│  2. npm run deploy:ENV      │
│     - deploy-supabase.ts    │
│     - deploy-n8n.ts         │
└─────────────────────────────┘
```

## Ambienti

### DEV (Cloud)
- **Scopo**: Sviluppo e test
- **Hosting**: n8n Cloud + Supabase Cloud
- **Branch**: `dev`
- **Direzione**: Solo estrazione (source of truth)

### STAGING (Self-hosted)
- **Scopo**: Test pre-production
- **Hosting**: Server self-hosted
- **Branch**: `staging`
- **Direzione**: Solo deployment (target)

### PRODUCTION (Self-hosted)
- **Scopo**: Ambiente live
- **Hosting**: Server self-hosted
- **Branch**: `main`
- **Direzione**: Solo deployment (target)

## Sicurezza

### File Sensibili (Non Committare)
- `config/.env.*` (senza .example)
- `.env`
- `*.log`
- `node_modules/`

### Credenziali Richieste

**DEV:**
- Supabase Cloud DB URL
- Supabase Cloud Access Token
- n8n Cloud API Key

**STAGING/PROD:**
- Supabase Self-hosted DB URL
- n8n Self-hosted API Key
- SSH credentials per GitHub Actions

### GitHub Secrets Richiesti

Per Staging:
- `STAGING_HOST`
- `STAGING_USER`
- `STAGING_SSH_KEY`
- `STAGING_DEPLOY_PATH`

Per Production:
- `PROD_HOST`
- `PROD_USER`
- `PROD_SSH_KEY`
- `PROD_DEPLOY_PATH`

## Tecnologie Utilizzate

- **TypeScript**: Linguaggio principale
- **Node.js**: Runtime
- **PostgreSQL**: Database (via Supabase)
- **Docker**: Containerizzazione (opzionale)
- **GitHub Actions**: CI/CD
- **Bash**: Script di setup
- **Make**: Task runner

## Dipendenze npm

**Production:**
- `axios`: HTTP client per API calls
- `dotenv`: Gestione variabili ambiente
- `chalk`: Logging colorato
- `commander`: CLI argument parsing

**Development:**
- `typescript`: Compilatore TS
- `tsx`: Esecuzione TS senza compilazione
- `@types/node`: Type definitions Node.js
