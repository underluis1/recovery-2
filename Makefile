.PHONY: help install extract-dev deploy-staging deploy-prod setup-server

help: ## Mostra questo messaggio di aiuto
	@echo "Comandi disponibili:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installa le dipendenze
	npm install

extract-dev: ## Estrai migrations e workflows da DEV
	npm run extract:dev

extract-supabase: ## Estrai solo migrations Supabase
	npm run extract:supabase

extract-n8n: ## Estrai solo workflows n8n
	npm run extract:n8n

deploy-staging: ## Deploy su STAGING
	npm run deploy:staging

deploy-prod: ## Deploy su PRODUCTION
	npm run deploy:prod

setup-server: ## Setup server (richiede argomento: staging o production)
	@if [ -z "$(ENV)" ]; then \
		echo "Errore: specifica ENV=staging o ENV=production"; \
		echo "Esempio: make setup-server ENV=staging"; \
		exit 1; \
	fi
	./scripts/setup-server.sh $(ENV)

check: ## Verifica configurazione
	@echo "Verificando configurazione..."
	@npm run type-check
	@echo "✓ Type check completato"
	@if [ -f "config/.env.dev" ]; then echo "✓ config/.env.dev trovato"; else echo "✗ config/.env.dev mancante"; fi
	@if [ -f "config/.env.staging" ]; then echo "✓ config/.env.staging trovato"; else echo "⚠ config/.env.staging mancante"; fi
	@if [ -f "config/.env.prod" ]; then echo "✓ config/.env.prod trovato"; else echo "⚠ config/.env.prod mancante"; fi

clean: ## Pulisci file temporanei
	rm -rf node_modules/
	rm -rf dist/
	rm -f *.log

push-staging: ## Commit e push su staging
	@read -p "Commit message: " msg; \
	git add .; \
	git commit -m "$$msg"; \
	git push origin staging

push-prod: ## Merge staging->main e push
	@echo "Merging staging into main..."
	git checkout main
	git merge staging
	git push origin main
	git checkout staging

status: ## Mostra stato repository
	@echo "Branch corrente:"
	@git branch --show-current
	@echo "\nStato:"
	@git status --short
	@echo "\nUltimi 3 commit:"
	@git log --oneline -3
