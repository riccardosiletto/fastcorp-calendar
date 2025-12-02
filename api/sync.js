/**
 * Vercel Serverless Function - Sync Endpoint
 * 
 * NOTA: Vercel serverless functions non hanno storage persistente su file system.
 * Questa versione usa memory storage temporaneo per demo.
 * Per produzione, considera: Vercel KV, Vercel Postgres, o MongoDB Atlas.
 */

// In-memory storage (reset ad ogni cold start - solo per demo)
// Per persistenza reale, usa un database esterno
let syncData = {
  projects: [],
  tasks: [],
  lastSync: new Date().toISOString()
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
    return res.status(200).json({
      success: true,
      data: syncData
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

      syncData = {
        projects,
        tasks,
        lastSync: new Date().toISOString()
      }

      console.log(`✅ Synced: ${projects.length} projects, ${tasks.length} tasks`)

      return res.status(200).json({
        success: true,
        message: 'Data synced successfully',
        lastSync: syncData.lastSync
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

