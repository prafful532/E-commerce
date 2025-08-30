import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp';
import '../src/index.css';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);

// Listen for parent route sync messages
window.addEventListener('message', (event: MessageEvent) => {
  try {
    const data = (event && (event as any).data) || {};
    if (!data || typeof data !== 'object') return;
    const { type, path } = data as { type?: string; path?: string };
    if (type === 'set-admin-route' && typeof path === 'string') {
      const desired = path.startsWith('#') ? path : `#${path}`;
      if (window.location.hash !== desired) {
        window.location.hash = desired;
      }
    }
  } catch {}
});

// Notify parent on route changes
const notifyParent = () => {
  const current = window.location.hash.replace(/^#/, '') || '/admin';
  try {
    window.parent?.postMessage({ type: 'admin-route', path: current }, '*');
  } catch {}
};

window.addEventListener('hashchange', notifyParent);
// Also notify on initial load
notifyParent();
