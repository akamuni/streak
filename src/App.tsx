import './App.css'
import { ColorModeProvider } from './context/ColorModeContext'
import AppRoutes from './routes/AppRoutes'
import NavBar from './components/NavBar'
import MobileBottomNavigation from './components/BottomNavigation'
import InstallBanner from './components/InstallBanner'
import { useLocation } from 'react-router-dom'
import { ToastProvider } from './components/common/ToastNotification'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from './context/AuthContext'
import { Box, Container, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useAuth } from './hooks/useAuth'
import { isStandalone, canInstallPWA } from './pwa-utils'
import { listenNotifications, Notification } from './services/notificationService'

function App() {
  const location = useLocation()
  // We only need AuthContext for route protection elsewhere, not directly in App
  const { } = useContext(AuthContext)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const hideNav = ['/login','/register'].includes(location.pathname)
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showBanner, setShowBanner] = useState(false)
  
  // Check if the banner should be shown (not in standalone mode and can install)
  useEffect(() => {
    const checkBannerVisibility = () => {
      const shouldShowBanner = !isStandalone() && canInstallPWA()
      setShowBanner(shouldShowBanner)
    }
    
    // Check initially
    checkBannerVisibility()
    
    // Listen for PWA events that might change banner visibility
    window.addEventListener('pwaInstallReady', checkBannerVisibility)
    window.addEventListener('pwaInstalled', () => setShowBanner(false))
    
    return () => {
      window.removeEventListener('pwaInstallReady', checkBannerVisibility)
      window.removeEventListener('pwaInstalled', () => setShowBanner(false))
    }
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}

    if (user) {
      // Listen for notifications when user is logged in
      unsubscribe = listenNotifications(user.uid, (fetchedNotifications) => {
        setNotifications(fetchedNotifications)
      })
    } else {
      // Reset notifications when logged out
      setNotifications([])
    }

    // Cleanup listener on component unmount or user change
    return () => unsubscribe()

  }, [user]) // Re-run effect when user changes

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Banner height in pixels for spacing calculations
  const BANNER_HEIGHT = '32px'
  
  return (
    <ColorModeProvider>
      <ToastProvider>
        {/* The banner is always rendered at the top level, outside other components */}
        {!hideNav && showBanner && <InstallBanner position="top" />}
        
        {/* NavBar with adjusted top position when banner is shown */}
        {!hideNav && (
          <Box sx={{ 
            position: 'fixed',
            top: showBanner ? BANNER_HEIGHT : 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            transition: 'top 0.3s ease'
          }}>
            <NavBar user={user} unreadNotificationCount={unreadCount} notifications={notifications} />
          </Box>
        )}
        <Box
          sx={{
            minHeight: '100vh',
            // Add padding for fixed navbar + banner if shown
            pt: !hideNav ? {
              xs: `calc(56px + ${showBanner ? BANNER_HEIGHT : '0px'})`,
              sm: `calc(64px + ${showBanner ? BANNER_HEIGHT : '0px'})`
            } : 0,
            pb: isMobile && !hideNav ? '64px' : 4, // Add padding for bottom navigation on mobile
            bgcolor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            transition: 'padding-top 0.3s ease',
          }}
        >
          <Container 
            maxWidth="lg" 
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3 },
              mx: 'auto',
              width: '100%',
            }}
          >
            <AppRoutes />
          </Container>
        </Box>
        {!hideNav && <MobileBottomNavigation />}
      </ToastProvider>
    </ColorModeProvider>
  )
}

export default App
