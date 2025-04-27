import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { registerSW } from 'virtual:pwa-register'
import { registerOfflineFallback, captureInstallPrompt } from './pwa-utils'

// Initialize PWA install prompt capture early
captureInstallPrompt()

// Register service worker for PWA with enhanced features
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    const shouldUpdate = confirm('New content available. Reload to update?')
    if (shouldUpdate) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    // Show a toast notification that the app is ready for offline use
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('VerseVoyage', {
        body: 'App is ready for offline use!',
        icon: '/icons/pwa-192x192.svg'
      })
    }
  },
  onRegistered(registration) {
    // Register the custom offline fallback handler
    registerOfflineFallback()
    
    // Check for updates every hour if the app is open that long
    setInterval(() => {
      registration?.update()
    }, 60 * 60 * 1000)
  },
  onRegisterError(error) {
    console.error('Service worker registration error:', error)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
