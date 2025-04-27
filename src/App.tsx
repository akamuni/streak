import './App.css'
import { ColorModeProvider } from './context/ColorModeContext'
import AppRoutes from './routes/AppRoutes'
import NavBar from './components/NavBar'
import MobileBottomNavigation from './components/BottomNavigation'
import { useLocation } from 'react-router-dom'
import { ToastProvider } from './components/common/ToastNotification'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from './context/AuthContext'
import { Box, Container, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useAuth } from './hooks/useAuth'
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

  return (
    <ColorModeProvider>
      <ToastProvider>
        {!hideNav && <NavBar user={user} unreadNotificationCount={unreadCount} notifications={notifications} />}
        <Box
          sx={{
            minHeight: '100vh',
            pt: !hideNav ? { xs: '56px', sm: '64px' } : 0, // Add padding for fixed navbar
            pb: isMobile && !hideNav ? '64px' : 4, // Add padding for bottom navigation on mobile
            bgcolor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
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
