import './App.css'
import { ColorModeProvider } from './context/ColorModeContext'
import AppRoutes from './routes/AppRoutes'
import NavBar from './components/NavBar'



function App() {
  return (
    <ColorModeProvider>
      <NavBar />
      <AppRoutes />
    </ColorModeProvider>
  )
}

export default App
