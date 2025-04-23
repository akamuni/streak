import React, { useState, useEffect, useContext } from 'react'
import { AppBar, Toolbar, Button, Box, useTheme, useMediaQuery, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import MenuIcon from '@mui/icons-material/Menu'
import ChatIcon from '@mui/icons-material/Chat'
import { AuthContext } from '../context/AuthContext'
import { listenFriendsList } from '../services/friendService'
import { getConversationId, listenLatestMessage } from '../services/chatService'

const NavBar: React.FC = () => {
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useContext(AuthContext)
  const [friendsList, setFriendsList] = useState<string[]>([])
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!user) return
    return listenFriendsList(user.uid, frs => setFriendsList(frs.map(f => f.id)))
  }, [user])

  useEffect(() => {
    if (!user) return
    const lastReads: Record<string, number> = JSON.parse(localStorage.getItem('lastReads') || '{}')
    const unsubs: (() => void)[] = []
    friendsList.forEach(id => {
      const convoId = getConversationId(user.uid, id)
      const unsub = listenLatestMessage(convoId, msg => {
        if (msg && msg.senderId !== user.uid && msg.ts.getTime() > (lastReads[id] || 0)) {
          setHasUnread(true)
        }
      })
      unsubs.push(unsub)
    })
    return () => unsubs.forEach(u => u())
  }, [friendsList, user])

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, to: '/' },
    { label: 'Reading', icon: <MenuBookIcon />, to: '/chapters' },
    { label: 'Friends', icon: <GroupIcon />, to: '/friends' },
    { label: 'Messages', icon: <ChatIcon />, to: '/messages' },
    { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
  ]

  return (
    <AppBar position="static">
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        {isMobile ? (
          <>
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <List sx={{ width: 250 }}>
                {navItems.map(item => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton component={Link} to={item.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map(item => {
              const icon = item.to === '/messages' && hasUnread
                ? <Badge color="error" variant="dot">{item.icon}</Badge>
                : item.icon
              return (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  color={location.pathname === item.to ? 'secondary' : 'inherit'}
                  startIcon={icon}
                >
                  {item.label}
                </Button>
              )
            })}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
