'use client'

import { useEffect, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: Date
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      const notification: Notification = {
        id: `${Date.now()}_${Math.random()}`,
        type,
        message,
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [notification, ...prev])
      return notification.id
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  useEffect(() => {
    // Connect to SSE stream
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/notifications/stream')

        eventSource.onopen = () => {
          setIsConnected(true)
          setError(null)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            addNotification(data.message, data.type || 'info')
          } catch (err) {
            console.error('Error parsing notification:', err)
          }
        }

        eventSource.addEventListener('reservation-created', (event: any) => {
          try {
            const data = JSON.parse(event.data)
            addNotification(
              `Nueva reserva: ${data.court} - ${data.time}`,
              'success'
            )
          } catch (err) {
            console.error('Error parsing event:', err)
          }
        })

        eventSource.addEventListener('reservation-cancelled', (event: any) => {
          try {
            const data = JSON.parse(event.data)
            addNotification(`Reserva cancelada: ${data.court}`, 'warning')
          } catch (err) {
            console.error('Error parsing event:', err)
          }
        })

        eventSource.onerror = () => {
          setIsConnected(false)
          setError('Conexión perdida')
          eventSource.close()

          // Reconnect after 5 seconds
          setTimeout(connectSSE, 5000)
        }

        return eventSource
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error connecting')
        return null
      }
    }

    const eventSource = connectSSE()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [addNotification])

  return {
    notifications,
    isConnected,
    error,
    addNotification,
    removeNotification,
    markAsRead,
  }
}
