import React from 'react'
import Login from '../components/auth/Login'
import { Box, Typography } from '@mui/material'

const LoginPage: React.FC = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h3" component="h1" gutterBottom>
      VerseVoyage
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      Track your reading, connect with friends, and stay motivated!
    </Typography>
    <Login />
  </Box>
)

export default LoginPage
