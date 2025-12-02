# 🔄 Setup Sincronizzazione Multi-Dispositivo

## Passo 1: Crea Database Upstash (2 minuti)

1. Vai su **https://console.upstash.com**
2. Clicca **"Sign up with GitHub"**
3. Clicca **"Create Database"**
4. Scegli:
   - **Name**: `fastcorp-calendar`
   - **Type**: Regional
   - **Region**: EU West (Frankfurt) o il più vicino
5. Clicca **"Create"**

## Passo 2: Copia le Credenziali

Dopo aver creato il database:
1. Vai nella tab **"REST API"**
2. Copia:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Passo 3: Aggiungi a Vercel

1. Vai su **https://vercel.com/riccardos-projects-72b3be3f/fastcorp-calendar/settings/environment-variables**
2. Aggiungi le due variabili:
   - `UPSTASH_REDIS_REST_URL` = (incolla URL)
   - `UPSTASH_REDIS_REST_TOKEN` = (incolla Token)
3. Clicca **"Save"**

## Passo 4: Redeploy

```bash
cd "/Users/riccardosiletto/fastcorp calendar"
vercel --prod --yes
```

## ✅ Fatto!

Ora i tuoi dati saranno sincronizzati automaticamente tra:
- 💻 Tutti i browser
- 📱 Tutti i dispositivi
- 🔄 In tempo reale

---

## 🆓 Upstash Free Tier

- 10.000 comandi/giorno (più che sufficiente!)
- 256 MB storage
- Nessuna carta di credito richiesta

