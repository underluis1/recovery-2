# Contributing

Grazie per il tuo interesse nel contribuire a questo progetto!

## Come Contribuire

### Reporting Bugs

Se trovi un bug:

1. Verifica che non sia già stato segnalato nella sezione Issues
2. Apri un nuovo issue con:
   - Titolo chiaro e descrittivo
   - Descrizione dettagliata del problema
   - Passi per riprodurre il bug
   - Comportamento atteso vs comportamento attuale
   - Screenshot (se applicabile)
   - Informazioni sull'ambiente (OS, Node version, etc.)

### Suggerire Miglioramenti

Per suggerire nuove funzionalità:

1. Apri un issue con label "enhancement"
2. Descrivi la funzionalità in dettaglio
3. Spiega perché sarebbe utile
4. Fornisci esempi d'uso

### Pull Requests

1. **Fork** il repository
2. **Crea** un branch per la tua feature: `git checkout -b feature/amazing-feature`
3. **Sviluppa** la tua feature
4. **Testa** le modifiche
5. **Commit** seguendo le convenzioni: `git commit -m "feat: add amazing feature"`
6. **Push** al branch: `git push origin feature/amazing-feature`
7. **Apri** una Pull Request

## Convenzioni di Codice

### Commit Messages

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Tipi:**
- `feat`: Nuova funzionalità
- `fix`: Bug fix
- `docs`: Solo documentazione
- `style`: Formattazione, missing semi colons, etc
- `refactor`: Refactoring del codice
- `test`: Aggiunta di test
- `chore`: Manutenzione

**Esempi:**
```
feat: add rollback functionality
fix: correct migration tracking bug
docs: update setup guide with Docker instructions
refactor: extract config validation to separate function
```

### Stile Codice TypeScript

- Usa TypeScript strict mode
- 2 spazi per indentazione
- Single quotes per stringhe
- Semicolons obbligatori
- Nomi descrittivi per variabili e funzioni
- Commenti JSDoc per funzioni pubbliche

### Struttura File

```typescript
/**
 * Descrizione del file
 */

// Imports
import { something } from 'somewhere';

// Types
interface MyInterface {
  // ...
}

// Constants
const CONSTANT = 'value';

// Main functions
export function mainFunction() {
  // ...
}

// Helper functions
function helperFunction() {
  // ...
}

// Execute if main
if (require.main === module) {
  // ...
}
```

### Testing

Prima di aprire una PR:

```bash
# Type check
npm run type-check

# Test extraction (richiede .env.dev configurato)
npm run extract:supabase

# Test deployment (richiede ambiente staging)
npm run healthcheck:staging
```

## Directory Structure

```
scripts/
├── extract/        # Script di estrazione da cloud
├── deploy/         # Script di deployment
└── utils/          # Utilities condivise
```

Quando aggiungi nuovi script:
- Mettili nella directory appropriata
- Aggiungi comando in `package.json`
- Aggiorna la documentazione
- Aggiungi esempi d'uso nel README

## Documentazione

Quando modifichi il codice:
- Aggiorna il README se cambi API/comandi
- Aggiorna SETUP_GUIDE se cambi setup
- Aggiungi entry in CHANGELOG
- Commenta codice complesso

## Processo di Review

1. Mantainer revisiona il codice
2. Eventuali richieste di modifica
3. Dopo approvazione, merge su main
4. Release con tag semantico

## Domande?

Apri un issue con label "question" o contatta i maintainer.

## Codice di Condotta

- Sii rispettoso
- Sii costruttivo nelle critiche
- Accetta il feedback
- Focus sul miglioramento del progetto
