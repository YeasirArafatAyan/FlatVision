import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

const ALLOWED_ORIGINS = [
  'https://flatvision.vercel.app',
  'http://localhost:3000',
]

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_PDF_SIZE = 20 * 1024 * 1024
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 10

const rateLimit = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

function setCorsHeaders(res: NextApiResponse, origin: string | undefined) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const apiKey = process.env.ocr_api_key
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  let backendUrl = process.env.next_public_api_url || ''
  if (!backendUrl) {
    return res.status(500).json({ error: 'Backend URL not configured' })
  }
  backendUrl = backendUrl.trim().replace(/\/+$/, '')

  const contentType = req.headers['content-type'] || ''
  if (!ALLOWED_CONTENT_TYPES.some(t => contentType.includes(t))) {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.' })
  }

  const isPdf = contentType.includes('application/pdf')
  const maxSize = isPdf ? MAX_PDF_SIZE : MAX_IMAGE_SIZE

  const chunks: Buffer[] = []
  let totalSize = 0
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    totalSize += buf.length
    if (totalSize > maxSize) {
      return res.status(413).json({ error: `File too large. Max size is ${isPdf ? '20MB' : '10MB'}.` })
    }
    chunks.push(buf)
  }
  const body = Buffer.concat(chunks)

  try {
    const response = await fetch(`${backendUrl}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'X-API-Key': apiKey,
      },
      body: body,
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(502).json({ error: 'Failed to connect to backend' })
  }
}
