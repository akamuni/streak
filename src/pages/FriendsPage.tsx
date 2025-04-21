import React from 'react'
import { Container, Typography } from '@mui/material'

const FriendsPage: React.FC = () => (
  <Container sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Friends
    </Typography>
    <Typography>
      Your friends list will appear here soon.
    </Typography>
  </Container>
)

export default FriendsPage
