# Changelog

Tutte le modifiche importanti al progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/lang/it/).

## [1.0.0] - 2024-01-15

### Aggiunto
- Setup iniziale repository
- Script di estrazione da Supabase Cloud
- Script di estrazione da n8n Cloud
- Script di deployment per Supabase
- Script di deployment per n8n
- GitHub Actions per deployment automatico
- Webhook server alternativo per deployment
- Script di setup server
- Documentazione completa nel README
- Supporto multi-ambiente (dev, staging, production)
- Sistema di tracking migrations
- Logging colorato e dettagliato
- Gestione errori e validazione configurazione

### Sicurezza
- File .env esclusi dal versioning
- Validazione signature webhook
- Supporto chiavi SSH per deployment

## [Unreleased]

### Da Aggiungere
- [ ] Rollback automatico in caso di errore
- [ ] Notifiche Slack/Discord per deployment
- [ ] Health check post-deployment
- [ ] Backup automatico pre-deployment
- [ ] Dashboard deployment status
- [ ] Test automatizzati
- [ ] Docker compose per ambienti self-hosted
