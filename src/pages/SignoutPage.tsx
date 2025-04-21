import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import { AuthContext } from '../context/AuthContext'
import { Container, Typography, CircularProgress, Box } from '@mui/material'

const SignoutPage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      logout().then(() => navigate('/login'))
    } else {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <Container sx={{ textAlign: 'center', mt: 4 }}>
      <Box>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Signing you out...
        </Typography>
      </Box>
    </Container>
  )
}

export default SignoutPage
