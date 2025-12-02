/**
 * Vercel Serverless Function - Sync Endpoint
 * 
 * Usa Upstash Redis per storage persistente tra tutti i dispositivi.
 * Configurare UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN nelle env vars.
 */

import { Redis } from '@upstash/redis'

const DATA_KEY = 'fastcorp-sync-data'

// Inizializza Redis solo se le variabili sono configurate
let redis = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// Fallback in-memory (per quando Redis non è configurato)
let memoryData = {
  projects: [],
  tasks: [],
  lastSync: new Date().toISOString()
}

async function getData() {
  if (redis) {
    try {
      const data = await redis.get(DATA_KEY)
      if (data) return data
    } catch (e) {
      console.error('Redis GET error:', e)
    }
  }
  return memoryData
}

async function setData(data) {
  if (redis) {
    try {
      await redis.set(DATA_KEY, data)
      return true
    } catch (e) {
      console.error('Redis SET error:', e)
    }
  }
  memoryData = data
  return true
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET - Retrieve data
  if (req.method === 'GET') {
    const syncData = await getData()
    return res.status(200).json({
      success: true,
      data: syncData,
      storage: redis ? 'upstash' : 'memory'
    })
  }

  // POST - Save data
  if (req.method === 'POST') {
    try {
      const { projects, tasks } = req.body

      if (!projects || !tasks) {
        return res.status(400).json({
          success: false,
          error: 'Missing projects or tasks'
        })
      }

      const syncData = {
        projects,
        tasks,
        lastSync: new Date().toISOString()
      }

      await setData(syncData)

      console.log(`✅ Synced: ${projects.length} projects, ${tasks.length} tasks (${redis ? 'Upstash' : 'Memory'})`)

      return res.status(200).json({
        success: true,
        message: 'Data synced successfully',
        lastSync: syncData.lastSync,
        storage: redis ? 'upstash' : 'memory'
      })
    } catch (error) {
      console.error('Error saving data:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to save data'
      })
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  })
}
