import React, { useState, useEffect, useContext } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  CircularProgress,
} from '@mui/material'
import { AuthContext } from '../context/AuthContext'
import { getConversationId, sendMessage, listenMessages } from '../services/chatService'

interface ChatDialogProps {
  open: boolean
  onClose: () => void
  friendId: string
  friendName?: string
  friendPhotoURL?: string
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose, friendId, friendName, friendPhotoURL }) => {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState<{ id: string; senderId: string; text: string; ts: Date }[]>([])
  const [text, setText] = useState('')
  const convoId = getConversationId(user.uid, friendId)

  useEffect(() => {
    if (!open) return
    const unsub = listenMessages(convoId, msgs => setMessages(msgs))
    return () => unsub()
  }, [open, convoId])

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage(convoId, user.uid, text.trim())
    setText('')
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chat with {friendName || friendId}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List sx={{ maxHeight: '60vh', overflowY: 'auto', px: 2, pt: 1 }}>
          {messages.map(msg => (
            <ListItem key={msg.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  src={msg.senderId === user.uid ? user.photoURL || undefined : friendPhotoURL}
                  alt={msg.senderId === user.uid ? 'You' : friendName}
                />
              </ListItemAvatar>
              <ListItemText
                primary={msg.text}
                secondary={msg.ts.toLocaleString()}
              />
            </ListItem>
          ))}
          {messages.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </List>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', gap: 1, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
          placeholder="Type a message..."
        />
        <Button onClick={handleSend} disabled={!text.trim()}>Send</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChatDialog
