import React from 'react'
import { AppBar, Toolbar, Button, Box } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'

const NavBar: React.FC = () => {
  const location = useLocation()
  const navItems = [
    { label: 'Home', icon: <HomeIcon />, to: '/' },
    { label: 'Reading', icon: <MenuBookIcon />, to: '/chapters' },
    { label: 'Friends', icon: <GroupIcon />, to: '/friends' },
    { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
  ]

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {navItems.map(item => (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              color={location.pathname === item.to ? 'secondary' : 'inherit'}
              startIcon={item.icon}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
