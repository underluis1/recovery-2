# Quick Start Guide - Deploy in 5 minuti

Questa guida ti permette di deployare l'intero stack Supabase + n8n in 5 minuti su qualsiasi server Ubuntu.

## Prerequisiti

- Server Ubuntu con accesso SSH
- Docker e Docker Compose installati
- Porte aperte: 8000 (Studio), 8001 (API), 5678 (n8n), 5432 (PostgreSQL)

## Step 1: Installa Docker (se non presente)

```bash
# SSH nel server
ssh user@your-server.com

# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installa Docker Compose
sudo apt install docker-compose -y

# Logout e login per applicare il gruppo docker
exit
ssh user@your-server.com
```

## Step 2: Clona e Configura

```bash
# Crea directory deployment
sudo mkdir -p /opt/deployments
sudo chown $USER:$USER /opt/deployments

# Clona repository
cd /opt/deployments
git clone https://github.com/TUO-USERNAME/recovery-2.git
cd recovery-2

# Copia e configura .env
cp .env.example .env
nano .env
```

### Configurazione Minima del .env

**Cambia almeno questi valori:**

```bash
# PostgreSQL (OBBLIGATORIO)
POSTGRES_PASSWORD=una-password-super-sicura

# JWT (OBBLIGATORIO) - Minimo 32 caratteri
JWT_SECRET=un-secret-jwt-di-almeno-32-caratteri-molto-lungo

# Supabase Dashboard (OBBLIGATORIO)
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=password-sicura-dashboard

# n8n Database (OBBLIGATORIO)
N8N_DB_PASSWORD=password-sicura-per-n8n-db

# n8n Access (OBBLIGATORIO)
N8N_USER=admin
N8N_PASSWORD=password-sicura-per-n8n

# Host Configuration (IMPORTANTE)
# Se hai un dominio, usa quello. Altrimenti usa l'IP del server
N8N_HOST=your-server-ip-or-domain
API_EXTERNAL_URL=http://your-server-ip-or-domain:8001
SUPABASE_PUBLIC_URL=http://your-server-ip-or-domain:8001

# Protocollo (lascia http per ora, cambia in https dopo setup SSL)
N8N_PROTOCOL=http
```

## Step 3: Avvia Tutto

```bash
# Avvia tutti i servizi
docker-compose up -d

# Monitora l'avvio (ci vogliono 1-2 minuti)
watch docker-compose ps
```

## Step 4: Accedi ai Servizi

### Supabase Studio
- URL: http://your-server-ip:8000
- Username: admin
- Password: quella del .env

### n8n
- URL: http://your-server-ip:5678
- Crea utente al primo accesso

## Troubleshooting

Se hai problemi, controlla i log:
```bash
docker-compose logs -f
```

Per la guida completa, vedi SETUP_GUIDE.md
