'use client'

import { io, Socket } from 'socket.io-client'
import { useEffect, useRef } from 'react'

export function useRealtime(datasetId?: string, onEvent?: (event: string, payload: any) => void) {
  const socketRef = useRef<Socket | null>(null)
  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', { transports: ['websocket'] })
    socketRef.current = s
    if (datasetId) s.emit('join', { datasetId })
    s.on('annotation:created', (payload) => onEvent?.('annotation:created', payload))
    return () => {
      if (datasetId) s.emit('leave', { datasetId })
      s.disconnect()
    }
  }, [datasetId])
  return socketRef
}