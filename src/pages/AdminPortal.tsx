import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const AdminPortal: React.FC = () => {
  const location = useLocation()
  const hashRoute = useMemo(() => `#${location.pathname}`, [location.pathname])
  const src = `/admin/index.html${hashRoute}`
  return (
    <div className="h-[calc(100vh-64px)]">
      <iframe
        src={src}
        title="Admin Portal"
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write;"
      />
    </div>
  )
}

export default AdminPortal
