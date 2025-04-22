import './App.css'
import { ColorModeProvider } from './context/ColorModeContext'
import AppRoutes from './routes/AppRoutes'
import NavBar from './components/NavBar'
import { useLocation } from 'react-router-dom'


function App() {
  const location = useLocation()
  const hideNav = ['/login','/register'].includes(location.pathname)
  return (
    <ColorModeProvider>
      {!hideNav && <NavBar />}
      <AppRoutes />
    </ColorModeProvider>
  )
}

export default App
