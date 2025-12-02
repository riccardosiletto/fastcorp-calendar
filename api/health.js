/**
 * Vercel Serverless Function - Health Check
 */

export default function handler(req, res) {
  res.status(200).json({
    success: true,
    status: 'running',
    timestamp: new Date().toISOString()
  })
}

