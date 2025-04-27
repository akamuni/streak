import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { listenUserProfile, UserProfile } from '../services/userService'
import { getConversationId, sendMessage, listenMessages } from '../services/chatService'
import { getUserDisplayName } from '../utils/userDisplay'
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material'

const ChatPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>()
  const { user } = useContext(AuthContext)
  const [friendProfile, setFriendProfile] = useState<Partial<UserProfile>>({})
  const [ownProfile, setOwnProfile] = useState<Partial<UserProfile>>({})
  const [messages, setMessages] = useState<{ id: string; senderId: string; text: string; ts: Date }[]>([])
  const [text, setText] = useState('')

  const convoId = user && friendId ? getConversationId(user.uid, friendId) : ''

  // load friend profile
  useEffect(() => {
    if (!friendId) return
    const unsub = listenUserProfile(friendId, data => setFriendProfile(data))
    return unsub
  }, [friendId])

  // load own profile
  useEffect(() => {
    if (!user) return
    const unsub = listenUserProfile(user.uid, data => setOwnProfile(data))
    return unsub
  }, [user])

  // load messages
  useEffect(() => {
    if (!convoId) return
    const unsub = listenMessages(convoId, msgs => setMessages(msgs))
    return unsub
  }, [convoId])

  const handleSend = async () => {
    if (!text.trim() || !convoId || !user) return
    await sendMessage(convoId, user.uid, text.trim())
    setText('')
  }

  if (!user || !friendId) return null

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Chat with {getUserDisplayName(friendProfile, friendId)}
      </Typography>
      <List sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 2 }}>
        {messages.length > 0 ? (
          messages.map(msg => {
            const isOwn = msg.senderId === user.uid
            const senderName = isOwn ? 'You' : getUserDisplayName(friendProfile, friendId)
            return (
              <ListItem
                key={msg.id}
                alignItems="flex-start"
                sx={{
                  display: 'flex',
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                  p: 0,
                  mb: 1,
                }}
              >
                <ListItemAvatar sx={{ alignSelf: 'flex-start', mr: isOwn ? 0 : 1, ml: isOwn ? 1 : 0 }}>
                  <Avatar src={isOwn ? ownProfile.photoURL || undefined : friendProfile.photoURL} />
                </ListItemAvatar>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: isOwn ? 'primary.main' : 'grey.100',
                    color: isOwn ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    maxWidth: '75%',
                    boxShadow: isOwn ? 3 : 1,
                  }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {msg.text}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: isOwn ? 'right' : 'left' }}>
                      {senderName} • {msg.ts.toLocaleTimeString()}
                    </Typography>
                  </CardContent>
                </Card>
              </ListItem>
            )
          })
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </List>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
          placeholder="Type a message..."
        />
        <Button variant="contained" onClick={handleSend} disabled={!text.trim()}>
          Send
        </Button>
      </Box>
    </Container>
  )
}

export default ChatPage
