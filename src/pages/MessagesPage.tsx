import React, { useContext, useState, useEffect } from 'react'
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
} from '@mui/material'
import { Link } from 'react-router-dom'
import ChatIcon from '@mui/icons-material/Chat'
import { AuthContext } from '../context/AuthContext'
import { listenFriendsList } from '../services/friendService'
import { listenUserProfile, UserProfile } from '../services/userService'

const MessagesPage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [friends, setFriends] = useState<{ id: string; since: string }[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})

  // load friends
  useEffect(() => {
    if (!user) return
    return listenFriendsList(user.uid, setFriends)
  }, [user])

  // fetch profiles
  useEffect(() => {
    friends.forEach(fr => {
      if (!profiles[fr.id]) {
        listenUserProfile(fr.id, profile => setProfiles(prev => ({ ...prev, [fr.id]: profile })))
      }
    })
  }, [friends])

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Messages</Typography>
      {friends.length === 0 ? (
        <Typography>No friends yet.</Typography>
      ) : (
        <List>
          {friends.map(fr => {
            const p = profiles[fr.id]
            return (
              <ListItem
                key={fr.id}
                secondaryAction={
                  <IconButton size="small" component={Link} to={`/chat/${fr.id}`}>
                    <ChatIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar src={p?.photoURL} />
                </ListItemAvatar>
                <ListItemText
                  primary={p?.username || fr.id}
                  secondary={`Friends since ${new Date(fr.since).toLocaleDateString()}`}
                />
              </ListItem>
            )
          })}
        </List>
      )}
    </Container>
  )
}

export default MessagesPage
