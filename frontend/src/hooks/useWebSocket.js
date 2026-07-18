import { useEffect, useRef, useState } from 'react'

export function useWebSocket(meetingId) {
  const [progress, setProgress] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!meetingId) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}?meetingId=${meetingId}`
    const ws  = new WebSocket(url.replace('localhost:5173', 'localhost:4000'))

    ws.onopen    = () => console.log('[WS] Connected for', meetingId)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setProgress(data)
    }
    ws.onclose = () => console.log('[WS] Disconnected')

    wsRef.current = ws
    return () => ws.close()
  }, [meetingId])

  return progress
}