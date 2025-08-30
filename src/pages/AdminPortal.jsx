import React, { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const BASE = '/admin'

const AdminPortal = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const iframeRef = useRef(null)

  const pathInAdmin = useMemo(() => {
    const p = location.pathname.startsWith(BASE) ? location.pathname : BASE
    return p
  }, [location.pathname])

  const src = useMemo(() => `/admin/index.html#${pathInAdmin}`, [pathInAdmin])

  useEffect(() => {
    function onMessage(event) {
      if (!event || !event.data) return
      const { type, path } = event.data || {}
      if (type === 'admin-route' && typeof path === 'string') {
        const normalized = path.startsWith(BASE) ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
        if (normalized !== location.pathname) {
          navigate(normalized, { replace: true })
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [location.pathname, navigate])

  useEffect(() => {
    const frame = iframeRef.current
    if (!frame) return
    try {
      frame.contentWindow?.postMessage({ type: 'set-admin-route', path: pathInAdmin }, '*')
    } catch {}
  }, [pathInAdmin])

  return (
    <div className="h-[calc(100vh-64px)]">
      <iframe
        ref={iframeRef}
        src={src}
        title="Admin Portal"
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write;"
      />
    </div>
  )
}

export default AdminPortal
