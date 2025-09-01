import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, X, Loader2 } from 'lucide-react'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user'|'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hi! I can help with product availability, prices, and shipping. What are you looking for today?' }
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput('')
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Sorry, I could not process that.' }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg bg-black text-white hover:opacity-90">
          <Bot className="w-5 h-5" /> Ask AI
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-[360px] h-[520px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[80%] ${m.role === 'assistant' ? 'ml-0' : 'ml-auto'}`}>
                  <div className={`${m.role === 'assistant' ? 'bg-white dark:bg-gray-800' : 'bg-black text-white'} rounded-2xl px-3 py-2 shadow`}>{m.content}</div>
                </div>
              ))}
              {loading && (<div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin"/> thinking…</div>)}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => (e.key === 'Enter' ? send() : null)} placeholder="Ask about availability, price, size…" className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900" />
              <button onClick={send} disabled={loading} className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 border-t">
              Tip: Try "Is SKU ABC-123 in stock?" or "Running shoes under ₹3000".
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
