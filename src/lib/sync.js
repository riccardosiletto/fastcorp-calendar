/**
 * FastCorp Calendar - Sync Module
 * Sincronizzazione SEMPRE ATTIVA tra dispositivi
 * Ogni modifica viene sincronizzata immediatamente
 */

// In development usa localhost, in production usa URL relativo
const SYNC_SERVER_URL = import.meta.env.DEV ? 'http://localhost:3003' : ''
const POLL_INTERVAL = 3000 // 3 secondi - polling per ricevere aggiornamenti

class SyncManager {
    constructor() {
        this.pollInterval = null
        this.lastServerSync = null
        this.isSyncing = false
        this.onDataReceived = null
        this.getLocalData = null
    }

    /**
     * Verifica se il server è disponibile
     */
    async checkServer() {
        try {
            const response = await fetch(`${SYNC_SERVER_URL}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            return response.ok
        } catch (error) {
            return false
        }
    }

    /**
     * Scarica i dati dal server
     */
    async pullData() {
        try {
            const response = await fetch(`${SYNC_SERVER_URL}/api/sync`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            if (!response.ok) return null

            const result = await response.json()
            if (result.success && result.data) {
                return result.data
            }
            return null
        } catch (error) {
            return null
        }
    }

    /**
     * Carica i dati sul server (chiamato IMMEDIATAMENTE ad ogni modifica)
     */
    async pushData(projects, tasks) {
        if (this.isSyncing) return false

        this.isSyncing = true
        try {
            const response = await fetch(`${SYNC_SERVER_URL}/api/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projects, tasks })
            })

            if (!response.ok) {
                this.isSyncing = false
                return false
            }

            const result = await response.json()
            if (result.success) {
                this.lastServerSync = result.lastSync
                console.log('📤 Synced to server:', tasks.length, 'tasks')
            }
            this.isSyncing = false
            return result.success
        } catch (error) {
            console.error('Push error:', error.message)
            this.isSyncing = false
            return false
        }
    }

    /**
     * Controlla se ci sono aggiornamenti dal server
     */
    async checkForUpdates() {
        if (this.isSyncing || !this.onDataReceived) return

        try {
            const serverData = await this.pullData()
            if (!serverData) return

            // Se il server ha un timestamp più recente, aggiorna i dati locali
            if (serverData.lastSync && serverData.lastSync !== this.lastServerSync) {
                const localData = this.getLocalData ? this.getLocalData() : null
                const localTaskCount = localData?.tasks?.length || 0
                const serverTaskCount = serverData.tasks?.length || 0

                // Aggiorna se il server ha dati diversi
                if (serverTaskCount !== localTaskCount || serverData.lastSync > this.lastServerSync) {
                    console.log('📥 New data from server:', serverTaskCount, 'tasks')
                    this.lastServerSync = serverData.lastSync
                    await this.onDataReceived(serverData)
                }
            }
        } catch (error) {
            // Silently fail - server might be down
        }
    }

    /**
     * Avvia il polling automatico per ricevere aggiornamenti
     */
    startPolling(getLocalData, onDataReceived) {
        this.getLocalData = getLocalData
        this.onDataReceived = onDataReceived

        if (this.pollInterval) return

        console.log('🔄 Auto-sync started (polling every 3s)')

        // Prima sync immediata
        this.initialSync()

        // Poi polling periodico
        this.pollInterval = setInterval(() => {
            this.checkForUpdates()
        }, POLL_INTERVAL)
    }

    /**
     * Prima sincronizzazione - scarica dati dal server se disponibili
     */
    async initialSync() {
        const serverAvailable = await this.checkServer()
        if (!serverAvailable) {
            console.log('⚠️ Sync server not available at startup')
            return
        }

        const serverData = await this.pullData()
        if (serverData && serverData.tasks && serverData.tasks.length > 0) {
            console.log('📥 Initial sync: loading', serverData.tasks.length, 'tasks from server')
            this.lastServerSync = serverData.lastSync
            if (this.onDataReceived) {
                await this.onDataReceived(serverData)
            }
        } else {
            // Se il server è vuoto, push i dati locali
            const localData = this.getLocalData ? this.getLocalData() : null
            if (localData && localData.tasks && localData.tasks.length > 0) {
                console.log('📤 Initial sync: pushing', localData.tasks.length, 'local tasks to server')
                await this.pushData(localData.projects, localData.tasks)
            }
        }
    }

    /**
     * Ferma il polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval)
            this.pollInterval = null
        }
    }

    /**
     * Sincronizza immediatamente (chiamato dopo ogni modifica)
     */
    async syncNow(projects, tasks) {
        return await this.pushData(projects, tasks)
    }
}

// Singleton
const syncManager = new SyncManager()

export default syncManager
