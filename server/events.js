import { EventEmitter } from 'events'

const emitter = new EventEmitter()
emitter.setMaxListeners(100)

const clients = new Set()

export function broadcast(type, payload = {}) {
  const data = JSON.stringify({ type, payload, ts: Date.now() })
  for (const res of clients) {
    try {
      res.write(`event: message\n`)
      res.write(`data: ${data}\n\n`)
    } catch {}
  }
}

export function eventsHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders && res.flushHeaders()
  res.write(`retry: 3000\n\n`)
  clients.add(res)
  const heartBeat = setInterval(() => {
    try { res.write(`: keep-alive ${Date.now()}\n\n`) } catch {}
  }, 15000)
  req.on('close', () => {
    clearInterval(heartBeat)
    clients.delete(res)
  })
}

export default { broadcast, eventsHandler }
