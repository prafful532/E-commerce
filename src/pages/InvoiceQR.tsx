import React, { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Copy, QrCode, Smartphone, CheckCircle, XCircle } from 'lucide-react'

function useHashRoute() {
  const [hash, setHash] = useState<string>(() => window.location.hash || '#/')
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const parts = hash.replace(/^#\//, '').split('/')
  const route = parts[0] || ''
  const param = parts[1] || ''
  return { route, param, setHash }
}

const currency = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(n || 0))

const uuid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

function saveInvoice(inv: any) {
  const all = JSON.parse(localStorage.getItem('invoices') || '{}')
  all[inv.id] = inv
  localStorage.setItem('invoices', JSON.stringify(all))
}
function loadInvoice(id: string) {
  const all = JSON.parse(localStorage.getItem('invoices') || '{}')
  return all[id] || null
}

function buildUpiLink({ vpa, payeeName, amount, note, ref }: { vpa: string; payeeName?: string; amount: number; note?: string; ref?: string }) {
  const params = new URLSearchParams({ pa: vpa, pn: payeeName || '', am: String(amount || 0), tn: note || '', cu: 'INR', tr: ref || '' })
  return `upi://pay?${params.toString()}`
}

interface LineItem { name: string; qty: number; price: number }

function LineItemRow({ item, onChange, onRemove }: { item: LineItem; onChange: (next: LineItem) => void; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center border-b pb-2">
      <input className="col-span-5 border rounded-lg px-2 py-1" placeholder="Item name" value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} />
      <input className="col-span-2 border rounded-lg px-2 py-1 text-center" type="number" min={1} value={item.qty} onChange={(e) => onChange({ ...item, qty: Number(e.target.value) })} />
      <input className="col-span-3 border rounded-lg px-2 py-1 text-right" type="number" step="0.01" value={item.price} onChange={(e) => onChange({ ...item, price: Number(e.target.value) })} />
      <button onClick={onRemove} className="col-span-2 text-red-600 hover:text-red-800 text-sm flex items-center justify-center">
        <Minus className="w-4 h-4 mr-1" /> Remove
      </button>
    </div>
  )
}

function NewInvoice({ goToInvoice }: { goToInvoice: (id: string) => void }) {
  const [merchant, setMerchant] = useState({ name: 'My Shop', vpa: '7878606937@paytm' })
  const [customer, setCustomer] = useState({ name: 'Customer' })
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10))
  const [items, setItems] = useState<LineItem[]>([{ name: 'Item 1', qty: 1, price: 100 }])
  const [discount, setDiscount] = useState<number | string>(0)
  const [taxRate, setTaxRate] = useState<number | string>(0)
  const [note, setNote] = useState('Thanks for shopping!')

  const addItem = () => setItems([...items, { name: '', qty: 1, price: 0 }])
  const updateItem = (i: number, it: LineItem) => setItems(items.map((x, idx) => (idx === i ? it : x)))
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const subtotal = useMemo(() => items.reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0), [items])
  const tax = useMemo(() => subtotal * (Number(taxRate) / 100), [subtotal, taxRate])
  const total = useMemo(() => Math.max(0, subtotal + tax - Number(discount || 0)), [subtotal, tax, discount])

  const create = () => {
    const inv = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      dueDate,
      merchant,
      customer,
      items,
      discount: Number(discount || 0),
      taxRate: Number(taxRate || 0),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      note,
      status: 'UNPAID',
    }
    saveInvoice(inv)
    goToInvoice(inv.id)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">🧾 Create Invoice</h1>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Merchant Name" value={merchant.name} onChange={(e) => setMerchant({ ...merchant, name: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Merchant UPI ID" value={merchant.vpa} onChange={(e) => setMerchant({ ...merchant, vpa: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Customer Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Due Date</label>
            <input type="date" className="border rounded-lg px-3 py-2 w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Line Items</h2>
            {items.map((it, i) => (
              <LineItemRow key={i} item={it} onChange={(next) => updateItem(i, next)} onRemove={() => removeItem(i)} />
            ))}
            <button className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg space-y-2 text-gray-700 dark:text-gray-200">
            <p>Subtotal: {currency(subtotal)}</p>
            <p>Tax: {currency(tax)}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Discount</label>
                <input className="border rounded-lg px-3 py-2 w-full" type="number" value={String(discount)} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Tax %</label>
                <input className="border rounded-lg px-3 py-2 w-full" type="number" value={String(taxRate)} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
            </div>
            <p className="font-bold text-lg">Total Due: <span className="text-green-600">{currency(total)}</span></p>
          </div>
          <div>
            <label className="text-sm">Note</label>
            <input className="border rounded-lg px-3 py-2 w-full" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full" onClick={create}>
            <QrCode className="w-4 h-4 mr-2" /> Generate Invoice & QR
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-6 flex flex-col items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300">QR Preview will appear after saving invoice</p>
        </div>
      </motion.div>
    </div>
  )
}

function InvoiceView({ id, goHome }: { id: string; goHome: () => void }) {
  const inv = loadInvoice(id)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<string>(inv?.status || 'UNPAID')

  const upiLink = useMemo(
    () => (inv ? buildUpiLink({ vpa: inv.merchant.vpa, payeeName: inv.merchant.name, amount: inv.total, note: `Invoice ${inv.id} for ${inv.customer.name}`, ref: inv.id }) : ''),
    [inv]
  )

  if (!inv) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl">Invoice Not Found</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={goHome}>Create New</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Invoice #{inv.id}</h1>
          <p className="text-gray-600 dark:text-gray-300">Customer: <b>{inv.customer.name}</b></p>
          <p className="text-gray-600 dark:text-gray-300">Merchant: <b>{inv.merchant.name}</b></p>
          <p className="text-gray-600 dark:text-gray-300">Due: {inv.dueDate}</p>
          <p className="font-semibold mt-2">Total: <span className="text-green-600">{currency(inv.total)}</span></p>
          <div className="mt-3">
            Status:{' '}
            {status === 'PAID' ? (
              <span className="inline-flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-1" /> PAID</span>
            ) : (
              <span className="inline-flex items-center text-red-600"><XCircle className="w-4 h-4 mr-1" /> UNPAID</span>
            )}
          </div>
          <button className="mt-4 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200" onClick={() => setStatus(status === 'PAID' ? 'UNPAID' : 'PAID')}>
            Toggle Status
          </button>
        </div>
        <div className="flex flex-col items-center">
          <QRCodeCanvas value={upiLink} size={220} includeMargin />
          <p className="text-sm mt-2 text-gray-400">Scan to Pay with Paytm / GPay / PhonePe</p>
          <a href={upiLink} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center w-full">
            <Smartphone className="w-4 h-4 mr-2" /> Pay Now
          </a>
          <button className="mt-2 border px-4 py-2 rounded-lg flex items-center justify-center w-full" onClick={async () => {
            await navigator.clipboard.writeText(upiLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}>
            <Copy className="w-4 h-4 mr-2" /> {copied ? 'Copied!' : 'Copy UPI Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceQRPage() {
  const { route, param, setHash } = useHashRoute()
  const goHome = () => setHash('#/')
  const goToInvoice = (id: string) => setHash(`#/${'invoice'}/${id}`)

  return (
    <AnimatePresence mode="wait">
      {route === 'invoice' && param ? (
        <motion.div key="invoice" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <InvoiceView id={param} goHome={goHome} />
        </motion.div>
      ) : (
        <motion.div key="new" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <NewInvoice goToInvoice={goToInvoice} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
