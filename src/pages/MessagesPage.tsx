import React, { useContext, useState, useEffect } from 'react'
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Badge,
  ListItemText,
  IconButton,
  TextField,
} from '@mui/material'
import { Link } from 'react-router-dom'
import ChatIcon from '@mui/icons-material/Chat'
import { AuthContext } from '../context/AuthContext'
import { listenFriendsList } from '../services/friendService'
import { UserProfile } from '../services/userService'
import { getConversationId, listenLatestMessage } from '../services/chatService'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const MessagesPage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [friends, setFriends] = useState<{ id: string; since: string }[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
  const [latestMessages, setLatestMessages] = useState<Record<string, { senderId: string; text: string; ts: Date } | null>>({})
  const [lastReads, setLastReads] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('lastReads') || '{}') } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('lastReads', JSON.stringify(lastReads))
  }, [lastReads])

  // load friends
  useEffect(() => {
    if (!user) return
    return listenFriendsList(user.uid, setFriends)
  }, [user])

  // fetch all friend profiles in batch when friends change
  useEffect(() => {
    if (!user || friends.length === 0) return
    const fetchProfiles = async () => {
      const profs: Record<string, UserProfile> = {}
      await Promise.all(friends.map(async fr => {
        const snap = await getDoc(doc(db, 'users', fr.id))
        if (snap.exists()) {
          profs[fr.id] = snap.data() as UserProfile
        }
      }))
      setProfiles(profs)
    }
    fetchProfiles()
  }, [friends, user])

  // listen for latest message per friend
  useEffect(() => {
    if (!user) return
    const unsubs: (() => void)[] = []
    friends.forEach(fr => {
      const convoId = getConversationId(user.uid, fr.id)
      const unsub = listenLatestMessage(convoId, msg => {
        setLatestMessages(prev => ({ ...prev, [fr.id]: msg }))
      })
      unsubs.push(unsub)
    })
    return () => unsubs.forEach(u => u())
  }, [friends, user])

  // sort friends by most recent message or friendship date
  const sortedFriends = [...friends].sort((a, b) => {
    const ta = latestMessages[a.id]?.ts.getTime() || new Date(a.since).getTime()
    const tb = latestMessages[b.id]?.ts.getTime() || new Date(b.since).getTime()
    return tb - ta
  })

  // search filter
  const [search, setSearch] = useState('')
  const filteredFriends = sortedFriends.filter(fr => {
    const username = profiles[fr.id]?.username || fr.id
    const text = latestMessages[fr.id]?.text || ''
    const q = search.toLowerCase()
    return username.toLowerCase().includes(q) || text.toLowerCase().includes(q)
  })

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Messages</Typography>
      {friends.length === 0 ? (
        <Typography>No friends yet.</Typography>
      ) : (
        <>
          <TextField
            fullWidth
            placeholder="Search messages"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {filteredFriends.map(fr => {
              const p = profiles[fr.id]
              const msg = latestMessages[fr.id]
              const isUnread = !!(
                msg &&
                msg.senderId !== user?.uid &&
                msg.ts.getTime() > (lastReads[fr.id] || 0)
              )
              return (
                <ListItem
                  key={fr.id}
                  secondaryAction={
                    <IconButton
                      size="small"
                      component={Link}
                      to={`/chat/${fr.id}`}
                      onClick={() => setLastReads(prev => ({ ...prev, [fr.id]: Date.now() }))}
                    >
                      <ChatIcon />
                    </IconButton>
                  }
                  // Highlight unread
                  sx={{ bgcolor: isUnread ? 'action.selected' : 'inherit' }}
                >
                  <ListItemAvatar>
                    <Badge color="secondary" variant="dot" invisible={!isUnread} overlap="circular">
                      <Avatar src={p?.photoURL} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={p?.username || fr.id}
                    primaryTypographyProps={{ fontWeight: isUnread ? 'bold' : 'normal' }}
                    secondary={
                      msg
                        ? `${msg.text.slice(0, 30)}${msg.text.length > 30 ? '...' : ''} • ${msg.ts.toLocaleTimeString()}`
                        : `No messages yet • since ${new Date(fr.since).toLocaleDateString()}`
                    }
                  />
                </ListItem>
              )
            })}
          </List>
        </>
      )}
    </Container>
  )
}

export default MessagesPage
