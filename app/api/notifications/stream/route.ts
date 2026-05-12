import { NextRequest, NextResponse } from 'next/server'

interface Client {
  response: ReadableStreamDefaultController
  id: string
}

const clients: Client[] = []

export async function GET(request: NextRequest) {
  const clientId = `${Date.now()}_${Math.random()}`

  // Set up SSE headers
  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({ type: 'connected', message: 'Conectado' })}\n\n`
      )

      // Store client
      const client: Client = { response: controller, id: clientId }
      clients.push(client)

      // Send a heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat at ${new Date().toISOString()}\n\n`)
        } catch (err) {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Cleanup when connection closes
      const cleanup = () => {
        clearInterval(heartbeat)
        const index = clients.findIndex((c) => c.id === clientId)
        if (index !== -1) {
          clients.splice(index, 1)
        }
        controller.close()
      }

      request.signal.addEventListener('abort', cleanup)
    },
  })

  return new NextResponse(stream, { headers: responseHeaders })
}

// Helper function to broadcast to all connected clients
export function broadcastNotification(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) {
  const data = { type, message, timestamp: new Date().toISOString() }

  clients.forEach((client) => {
    try {
      client.response.enqueue(`data: ${JSON.stringify(data)}\n\n`)
    } catch (err) {
      console.error('Error sending notification:', err)
    }
  })
}
