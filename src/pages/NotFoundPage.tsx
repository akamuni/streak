import React from 'react'
import { Container, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const NotFoundPage: React.FC = () => (
  <Container sx={{ textAlign: 'center', mt: 4 }}>
    <Typography variant="h3" gutterBottom>
      404 - Page Not Found
    </Typography>
    <Button
      component={RouterLink}
      to="/"
      variant="contained"
      color="primary"
    >
      Go Home
    </Button>
  </Container>
)

export default NotFoundPage
