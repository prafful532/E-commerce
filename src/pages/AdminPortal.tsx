import React from 'react'

const AdminPortal: React.FC = () => {
  return (
    <div className="h-[calc(100vh-64px)]">
      <iframe
        src="/admin/index.html"
        title="Admin Portal"
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write;"
      />
    </div>
  )
}

export default AdminPortal
