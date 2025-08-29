import React, { useEffect, useState } from 'react'
import LoadingSpinner from '../../src/components/ui/LoadingSpinner'
import api from '../../src/lib/api'

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']

interface OrderRow {
  id: string
  user?: { full_name?: string; email?: string } | null
  items: any[]
  shipping_address: any
  payment_status: string
  status: string
  total_amount_inr: number
  created_at: string
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/orders')
      if (data?.success) setOrders(data.data)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data } = await api.put(`/admin/orders/${id}/status`, { status })
      if (data?.success) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) return (
    <div className="p-8"><LoadingSpinner /></div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Orders</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Total (INR)</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-sm">#{o.id.slice(-8).toUpperCase()}<div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</div></td>
                <td className="px-4 py-3 text-sm">
                  <div>{o.user?.full_name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{o.user?.email || ''}</div>
                </td>
                <td className="px-4 py-3 text-sm">₹{o.total_amount_inr?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{o.payment_status}</td>
                <td className="px-4 py-3 text-sm">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="border rounded px-2 py-1">
                    {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminOrders
