import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link as RouterLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { ColorModeContext } from '../context/ColorModeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../hooks/useAuth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import { listenFriendsList } from '../services/friendService';
import { getConversationId, listenLatestMessage } from '../services/chatService';
import { User } from 'firebase/auth';
import { Notification } from '../services/notificationService';

interface NavBarProps {
  user: User | null;
  unreadNotificationCount: number;
  notifications: Notification[];
}

const NavBar: React.FC<NavBarProps> = ({ user, unreadNotificationCount, notifications }) => {
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [friendsList, setFriendsList] = useState<string[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const colorModeContext = useContext(ColorModeContext);
  const toggleColorMode = colorModeContext ? colorModeContext.toggleColorMode : () => { console.error("ColorModeContext not found"); };

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
    return () => unsubs.forEach(u => u());
  }, [friendsList, user]);

  const navItems = [
    { label: 'Reading', icon: <MenuBookIcon fontSize="medium" />, to: '/' },
    { label: 'Friends', icon: <GroupIcon fontSize="medium" />, to: '/friends' },
    { label: 'Messages', icon: <ChatIcon fontSize="medium" />, to: '/messages' },
  ];

  const handleOpenNotifMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
  };
  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    try {
      await signOut();
      navigate('/login'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        bgcolor: theme.palette.primary.main,
        borderRadius: { xs: 0, md: '0 0 16px 16px' }, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        mx: 'auto', 
        left: 0,
        right: 0,
        width: '100%', 
        maxWidth: { xs: '100%', md: '1200px' },
        top: 0,
        zIndex: theme.zIndex.drawer + 1, 
        borderBottom: '1px solid',
        borderColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          px: { xs: 2, sm: 3 }, 
          minHeight: { xs: '56px', sm: '64px' },
          transition: 'all 0.3s ease',
        }}
      >
        {isMobile ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '100%', 
              alignItems: 'center' 
            }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700, 
                  letterSpacing: '-0.01em',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Scripture Tracker
              </Typography>
              <IconButton 
                color="inherit" 
                edge="end" 
                onClick={() => setDrawerOpen(true)} 
                sx={{ 
                  ml: 1, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  } 
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer 
              anchor="right" 
              open={drawerOpen} 
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  width: 280,
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                  boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
                  pt: 2,
                }
              }}
            >
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Menu
                </Typography>
              </Box>
              <List sx={{ px: 1 }}>
                {navItems.map(item => {
                  const isActive = location.pathname === item.to;
                  const icon = item.to === '/messages' && hasUnread
                    ? <Badge color="error" variant="dot">{React.cloneElement(item.icon, { fontSize: "medium" })}</Badge>
                    : React.cloneElement(item.icon, { fontSize: "medium" });
                    
                  return (
                    <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton 
                        component={Link} 
                        to={item.to} 
                        onClick={() => setDrawerOpen(false)}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          ...(isActive && {
                            bgcolor: `${theme.palette.primary.main}15`,
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          })
                        }}
                      >
                        <ListItemIcon sx={{ 
                          color: isActive ? theme.palette.primary.main : 'inherit',
                          minWidth: 40,
                        }}>
                          {icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label} 
                          primaryTypographyProps={{
                            fontSize: '0.95rem',
                            fontWeight: isActive ? 600 : 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
                <ListItem key="/notifications" disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    component={Link} 
                    to="/notifications" 
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: 'inherit',
                      minWidth: 40,
                    }}>
                      <Badge badgeContent={unreadNotificationCount} color="error">
                        <NotificationsIcon fontSize="medium" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Notifications" 
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem key="/notifications-menu" disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    onClick={(e) => { 
                      handleOpenNotifMenu(e); 
                      setDrawerOpen(false); 
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: 'inherit',
                      minWidth: 40,
                    }}>
                      <Badge badgeContent={unreadNotificationCount} color="error">
                        <NotificationsIcon fontSize="medium" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Notifications" 
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem key="sign-out" disablePadding>
                  <ListItemButton onClick={handleSignOut} sx={{ borderRadius: 2, py: 1.5 }}>
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      <LogoutIcon fontSize="medium" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
            <Menu
              id="notification-menu"
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              MenuListProps={{
                'aria-labelledby': 'notification-button',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                style: {
                  maxHeight: 400, 
                  width: '300px', 
                },
              }}
            >
              {notifications.length === 0 ? (
                <MenuItem disabled onClick={handleCloseNotifMenu}>
                  <ListItemText primary="No new notifications" />
                </MenuItem>
              ) : (
                notifications.map((notif) => (
                  <MenuItem 
                    key={notif.id} 
                    onClick={handleCloseNotifMenu} 
                  >
                    <ListItemText 
                      primary={notif.message} 
                      secondary={`From: ${notif.fromUserId} - ${notif.createdAt.toLocaleTimeString()}`} 
                    />
                  </MenuItem>
                ))
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%', 
            maxWidth: 1000,
          }}>
            <Typography 
              variant="h6" 
              component={Link}
              to="/"
              sx={{ 
                fontWeight: 700, 
                color: '#fff',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                mr: 4,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 0.9,
                }
              }}
            >
              Scripture Tracker
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 3,
              p: 0.5,
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)',
            }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.to;
                const icon = item.to === '/messages' && hasUnread
                  ? <Badge color="error" variant="dot">{React.cloneElement(item.icon, { fontSize: "medium" })}</Badge>
                  : React.cloneElement(item.icon, { fontSize: "medium" });
                
                return (
                  <Box 
                    key={item.to}
                    component={Link} 
                    to={item.to}
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                      ...(isActive && {
                        bgcolor: 'rgba(255,255,255,0.15)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      })
                    }}
                  >
                    {icon}
                    <Box sx={{ 
                      mt: 0.5, 
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '0.01em',
                    }}>
                      {item.label}
                    </Box>
                  </Box>
                );
              })}
              {/* Restructure Notifications like other nav items */}
              <Box
                onClick={handleOpenNotifMenu} 
                aria-controls={anchorElNotif ? 'notification-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorElNotif ? 'true' : undefined}
                sx={{ 
                  color: 'white',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  px: 2, 
                  py: 1, 
                  borderRadius: 2, 
                  transition: 'all 0.2s ease', 
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)', 
                  },
                }}
              >
                <Badge badgeContent={unreadNotificationCount} color="error">
                  <NotificationsIcon fontSize="medium" />
                </Badge>
                {/* Add Notifications Label */}
                <Box sx={{
                  mt: 0.5, 
                  fontSize: '0.75rem',
                  fontWeight: 500, 
                  letterSpacing: '0.01em',
                }}>
                  Notifications
                </Box>
              </Box>
              <Menu
                id="notification-menu"
                anchorEl={anchorElNotif}
                open={Boolean(anchorElNotif)}
                onClose={handleCloseNotifMenu}
                MenuListProps={{
                  'aria-labelledby': 'notification-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  style: {
                    maxHeight: 400, 
                    width: '300px', 
                  },
                }}
              >
                {notifications.length === 0 ? (
                  <MenuItem disabled onClick={handleCloseNotifMenu}>
                    <ListItemText primary="No new notifications" />
                  </MenuItem>
                ) : (
                  notifications.map((notif) => (
                    <MenuItem 
                      key={notif.id} 
                      onClick={handleCloseNotifMenu} // TODO: Add mark as read functionality
                    >
                      <ListItemText 
                        primary={notif.message} 
                        secondary={`From: ${notif.fromUserId} - ${notif.createdAt.toLocaleTimeString()}`} // Example secondary text
                      />
                    </MenuItem>
                  ))
                )}
              </Menu>
              <Tooltip title="Account settings">
                {/* Restructure Profile like other nav items */}
                <Box
                  onClick={handleMenuOpen}
                  sx={{ 
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    px: 2, 
                    py: 1, 
                    borderRadius: 2, 
                    transition: 'all 0.2s ease', 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)', 
                    }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }} src={user?.photoURL || undefined} />
                  {/* Add Profile Label */}
                  <Box sx={{
                    mt: 0.5, 
                    fontSize: '0.75rem',
                    fontWeight: 500, 
                    letterSpacing: '0.01em',
                  }}>
                    Profile
                  </Box>
                </Box>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem component={RouterLink} to="/profile">
                  <PersonIcon sx={{ mr: 1.5 }} fontSize="medium" /> Profile
                </MenuItem>
                <MenuItem onClick={toggleColorMode}>
                  {theme.palette.mode === 'dark' ? <Brightness7Icon sx={{ mr: 1.5 }} fontSize="medium" /> : <Brightness4Icon sx={{ mr: 1.5 }} fontSize="medium" />} Toggle theme
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleSignOut}>
                  <LogoutIcon sx={{ mr: 1.5 }} fontSize="medium" />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
