import React, { useContext, useEffect, useState } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import { AuthContext } from '../context/AuthContext';
import { listenFriendsList } from '../services/friendService';
import { getConversationId, listenLatestMessage } from '../services/chatService';

const MobileBottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Get the current path without trailing slash
  const currentPath = location.pathname.endsWith('/') && location.pathname !== '/' 
    ? location.pathname.slice(0, -1) 
    : location.pathname;

  useEffect(() => {
    if (!user) return;
    return listenFriendsList(user.uid, frs => setFriendsList(frs.map(f => f.id)));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const lastReads: Record<string, number> = JSON.parse(localStorage.getItem('lastReads') || '{}');
    const unsubs: (() => void)[] = [];
    
    friendsList.forEach(id => {
      const convoId = getConversationId(user.uid, id);
      const unsub = listenLatestMessage(convoId, msg => {
        if (msg && msg.senderId !== user.uid && msg.ts.getTime() > (lastReads[id] || 0)) {
          setHasUnread(true);
        }
      });
      unsubs.push(unsub);
    });
    
    return () => unsubs.forEach(u => u());
  }, [friendsList, user]);

  const navItems = [
    { label: 'Reading', icon: <MenuBookIcon />, to: '/' },
    { label: 'Friends', icon: <GroupIcon />, to: '/friends' },
    { label: 'Messages', icon: hasUnread ? (
      <Badge color="error" variant="dot">
        <ChatIcon />
      </Badge>
    ) : <ChatIcon />, to: '/messages' },
    { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
  ];

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: { xs: 'block', sm: 'none' }, // Only show on mobile
        padding: 0,
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={currentPath}
        sx={{
          bgcolor: 'background.paper',
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: 'text.secondary',
          },
          '& .Mui-selected': {
            color: 'primary.main',
          }
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction 
            key={item.to}
            component={Link}
            to={item.to}
            value={item.to}
            label={item.label}
            icon={item.icon}
            sx={{
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNavigation;
