# 🔄 Sistema di Sincronizzazione FastCorp Calendar

## Panoramica

FastCorp Calendar implementa un **sistema di backup multiplo** per garantire che i dati non vengano mai persi:

1. **IndexedDB** (database locale del browser)
2. **localStorage** (backup automatico ogni volta che cambiano i dati)
3. **Server di sincronizzazione** (opzionale, per condividere tra dispositivi)

## Caratteristiche

✅ **Backup Automatico Locale**
- I dati vengono automaticamente salvati in IndexedDB
- Backup automatico in localStorage ad ogni modifica
- Ripristino automatico se i dati vengono persi

✅ **Sincronizzazione Multi-dispositivo**
- Server opzionale per sincronizzare tra dispositivi
- Nessuna autenticazione richiesta (perfetto per uso personale/team)
- Sincronizzazione automatica ogni 30 secondi (quando abilitata)

✅ **Ripristino Dati Iniziali**
- Se i dati vengono persi, vengono automaticamente ripristinati
- I dati iniziali sono sempre disponibili come fallback

## Come Usare

### 1. Solo Locale (Browser Singolo)

Se usi FastCorp Calendar solo su un dispositivo:

1. Avvia l'applicazione: `npm run dev`
2. I tuoi dati saranno automaticamente salvati e protetti con backup multipli

**Non è necessario avviare il server di sincronizzazione.**

### 2. Multi-dispositivo (Con Sincronizzazione)

Se vuoi sincronizzare i dati tra più dispositivi:

#### Passo 1: Avvia il Server di Sincronizzazione

```bash
# In un terminale separato
npm run server
```

Il server partirà su `http://localhost:3003`

#### Passo 2: Avvia l'Applicazione

```bash
# In un altro terminale
npm run dev
```

#### Passo 3: Abilita la Sincronizzazione

1. Clicca sul pulsante **"Sync Off"** nella sidebar (in basso)
2. Il pulsante diventerà verde **"Sync On"**
3. I dati verranno sincronizzati automaticamente ogni 30 secondi

#### Passo 4: Usa su Altri Dispositivi

1. Su ogni dispositivo, apri `http://localhost:3002/` (o l'indirizzo del server)
2. Abilita la sincronizzazione come sopra
3. I dati saranno automaticamente condivisi tra tutti i dispositivi

### 3. Sincronizzazione Manuale

Puoi anche sincronizzare manualmente:

1. Assicurati che la sincronizzazione sia attivata
2. Clicca sul pulsante **"Sync"** con l'icona di refresh
3. I dati verranno immediatamente sincronizzati

## Comandi Utili

```bash
# Avvia solo l'applicazione
npm run dev

# Avvia solo il server di sincronizzazione
npm run server

# Avvia entrambi contemporaneamente
npm start

# Build per produzione
npm run build
```

## Backup e Ripristino Manuale

### Export (Esportare i dati)

1. Clicca sul pulsante **"Export"** nella sidebar
2. Verrà scaricato un file JSON con tutti i tuoi dati
3. Salva questo file in un luogo sicuro

### Import (Importare i dati)

1. Clicca sul pulsante **"Import"** nella sidebar
2. Seleziona il file JSON esportato
3. I dati verranno ripristinati

## File del Sistema

```
fastcorp calendar/
├── src/
│   ├── lib/
│   │   ├── indexeddb.js         # Database locale
│   │   └── sync.js               # Modulo di sincronizzazione
│   └── context/
│       └── AppContext.jsx        # Gestione stato e backup
├── server.js                     # Server di sincronizzazione
├── sync-data.json               # Dati sincronizzati (generato automaticamente)
└── restore-tasks.html           # Pagina di ripristino emergenza
```

## Risoluzione Problemi

### Le task sono scomparse!

1. **Ricarica la pagina** - Il sistema ripristinerà automaticamente i dati dal backup
2. Se non funziona, apri `http://localhost:3002/restore-tasks.html` e clicca "Ripristina"
3. In alternativa, usa l'Import per caricare un backup precedente

### Il server di sincronizzazione non funziona

1. Verifica che il server sia in esecuzione: `npm run server`
2. Controlla che la porta 3003 non sia in uso
3. Se il server non è disponibile, l'app continuerà a funzionare in modalità locale

### I dati non si sincronizzano tra dispositivi

1. Assicurati che il server sia in esecuzione
2. Verifica che la sincronizzazione sia abilitata su tutti i dispositivi
3. Clicca sul pulsante "Sync" per forzare la sincronizzazione
4. Controlla la console del browser per eventuali errori

## Sicurezza

⚠️ **Importante:** Il server di sincronizzazione NON ha autenticazione. È progettato per:
- Uso personale su una rete locale
- Piccoli team che si fidano l'uno dell'altro
- Ambienti di sviluppo

Se hai bisogno di condividere l'applicazione pubblicamente, implementa un sistema di autenticazione.

## Deployment in Produzione

Per deployare in produzione con sincronizzazione:

1. Deploya il server su un servizio come Heroku, Render, o Railway
2. Modifica `SYNC_SERVER_URL` in `src/lib/sync.js` con l'URL del tuo server
3. Aggiungi autenticazione se necessario
4. Usa un database persistente (PostgreSQL, MongoDB, ecc.) invece del file JSON

## Supporto

Per problemi o domande, controlla:
- La console del browser (F12 → Console)
- I log del server (terminale dove esegui `npm run server`)
- Il file `sync-data.json` per verificare che i dati siano salvati

