import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { API_BASE } from '../services/api'

export function useAuctionSocket(auctionId, onUpdate) {
  const callback = useRef(onUpdate)
  callback.current = onUpdate

  useEffect(() => {
    if (!auctionId) return
    const token = localStorage.getItem('accessToken')
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      onConnect: () => client.subscribe(`/topic/auctions/${auctionId}`, message => {
        try { callback.current(JSON.parse(message.body)) } catch { /* ignore malformed event */ }
      }),
    })
    client.activate()
    return () => { client.deactivate() }
  }, [auctionId])
}
