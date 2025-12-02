/**
 * FastCorp Calendar - Simple Sync Server
 * Server semplice per sincronizzare i dati tra dispositivi senza autenticazione
 */

import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003
const DATA_FILE = path.join(__dirname, 'sync-data.json')

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Initialize data file if it doesn't exist
async function initDataFile() {
    try {
        await fs.access(DATA_FILE)
    } catch {
        // File doesn't exist, create it with initial data
        const initialData = {
            projects: [],
            tasks: [],
            lastSync: new Date().toISOString()
        }
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2))
        console.log('📁 Created sync-data.json')
    }
}

// GET /api/sync - Get all data
app.get('/api/sync', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8')
        const parsedData = JSON.parse(data)
        res.json({
            success: true,
            data: parsedData
        })
    } catch (error) {
        console.error('Error reading data:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to read data'
        })
    }
})

// POST /api/sync - Save all data
app.post('/api/sync', async (req, res) => {
    try {
        const { projects, tasks } = req.body

        if (!projects || !tasks) {
            return res.status(400).json({
                success: false,
                error: 'Missing projects or tasks'
            })
        }

        const data = {
            projects,
            tasks,
            lastSync: new Date().toISOString()
        }

        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))

        console.log(`✅ Synced: ${projects.length} projects, ${tasks.length} tasks`)

        res.json({
            success: true,
            message: 'Data synced successfully',
            lastSync: data.lastSync
        })
    } catch (error) {
        console.error('Error saving data:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to save data'
        })
    }
})

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        timestamp: new Date().toISOString()
    })
})

// Start server
async function startServer() {
    await initDataFile()

    app.listen(PORT, () => {
        console.log(`🚀 FastCorp Sync Server running on http://localhost:${PORT}`)
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
        console.log(`🔄 Sync endpoint: http://localhost:${PORT}/api/sync`)
    })
}

startServer()

