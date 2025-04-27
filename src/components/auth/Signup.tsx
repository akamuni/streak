import React, { useState } from 'react'
import { signup } from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import { Container, Box, TextField, Button, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { getAdditionalUserInfo } from 'firebase/auth';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must include an uppercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must include a number'
    if (!/[!@#$%^&*]/.test(pwd)) return 'Password must include a special character'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const pwdErr = validatePassword(password)
    if (pwdErr) {
      setPasswordError(pwdErr)
      return
    }
    try {
      const userCredential = await signup(email, password);
      const additionalInfo = getAdditionalUserInfo(userCredential);

      if (additionalInfo?.isNewUser) {
          navigate('/setup', { replace: true });
      } else {
          console.log('Signup completed, but user is not marked as new. Auth listener should redirect.');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
          setError('This email address is already registered. Please log in or use a different email.');
          setPasswordError('');
      } else if (error.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
          setPasswordError('');
      } else if (error.code === 'auth/weak-password') {
          setError('Password is too weak.');
          setPasswordError('Password is too weak.');
      } else {
          setError('An unexpected error occurred during signup.');
          setPasswordError('');
      }
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        {error && (
            <Typography color="error" sx={{ mt: 1, mb: 1 }}>
                {error}
            </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
            error={!!passwordError}
            helperText={passwordError}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign Up
          </Button>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have an account? Login
          </Link>
        </Box>
      </Box>
    </Container>
  )
}

export default Signup
