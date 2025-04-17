import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const API_TIMEOUT = 5000

interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

async function checkBackendHealth(): Promise<boolean> {
  try {
    console.log(API_URL)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${API_URL}/health`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  // Check backend health first
  const isHealthy = await checkBackendHealth()
  if (!isHealthy) {
    console.error('[API] Backend server is not responding')
    return NextResponse.json({
      success: false,
      message: 'Backend service is unavailable'
    }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    console.log('[API] Forwarding request to backend server')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`[API] Backend server error: ${response.status}`, errorText)
      return NextResponse.json({
        success: false,
        message: `Backend error (${response.status}): ${errorText}`
      }, { 
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const data: ApiResponse = await response.json()
    console.log('[API] Backend server response:', data)

    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[API] Request processing error:', errorMessage)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process request',
      error: errorMessage
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  const isHealthy = await checkBackendHealth()
  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString()
  }, { 
    status: isHealthy ? 200 : 503 
  })
}