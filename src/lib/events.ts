class EventBus {
  private source: EventSource | null = null
  private listeners: { [type: string]: Set<(p: any)=>void> } = {}

  connect() {
    if (this.source) return
    this.source = new EventSource('/api/events')
    this.source.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        this.emit(msg.type, msg.payload)
      } catch {}
    }
    this.source.onerror = () => {}
  }

  on(type: string, cb: (payload: any)=>void) {
    if (!this.listeners[type]) this.listeners[type] = new Set()
    this.listeners[type].add(cb)
    this.connect()
    return () => this.off(type, cb)
  }

  off(type: string, cb: (payload: any)=>void) {
    this.listeners[type]?.delete(cb)
  }

  private emit(type: string, payload: any) {
    const cbs = this.listeners[type]
    if (cbs) for (const cb of cbs) cb(payload)
  }
}

const bus = new EventBus()
export default bus
