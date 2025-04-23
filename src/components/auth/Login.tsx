import React, { useState, useEffect } from 'react'
import { login, signInWithGoogle } from '../../services/authService'
import { Container, Paper, Box, TextField, Button, Typography, Link } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import GoogleIcon from '@mui/icons-material/Google'
import Spinner from '../common/Spinner'
import { useAuth } from '../../hooks/useAuth'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Scripture verses for login screen
  const scriptures = [
    '“And if men come unto me I will show unto them their weakness.” – Ether 12:27',
    '“I will go and do the things which the Lord hath commanded.” – 1 Nephi 3:7',
    '“Faith is things which are hoped for and not seen.” – Hebrews 11:1'
  ]
  const [verse, setVerse] = useState<string>('')

  useEffect(() => {
    if (!loading && user) {
      navigate('/chapters', { replace: true })
    }
  }, [user, loading, navigate])

  // Pick a random verse on mount
  useEffect(() => {
    setVerse(scriptures[Math.floor(Math.random() * scriptures.length)])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, bgcolor: 'rgba(67,160,71,0.1)', borderRadius: 2 }}>
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2, display: 'grid', rowGap: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#43a047',
                    boxShadow: '0 0 0 3px rgba(67,160,71,0.3)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#43a047',
                    boxShadow: '0 0 0 3px rgba(67,160,71,0.3)',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogle}
              sx={{ mt: 1, mb: 2, py: 1.5 }}
            >
              Sign in with Google
            </Button>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Register
            </Link>
          </Box>
          {/* Verse at bottom */}
          <Typography variant="body2" align="center" sx={{ mt: 3, mb: 4, fontStyle: 'italic', color: 'text.disabled' }}>
            {verse}
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login
