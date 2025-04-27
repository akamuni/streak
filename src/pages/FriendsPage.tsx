import React, { useContext, useState, useEffect } from 'react'
import { Container, Typography, Box, TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, Autocomplete, CircularProgress, IconButton } from '@mui/material'
import { AuthContext } from '../context/AuthContext'
import { listenUserProfile, UserProfile, searchUsersByUsername, SearchUser } from '../services/userService'
import { sendFriendRequest, withdrawFriendRequest, listenIncomingRequests, listenOutgoingRequests, listenFriendsList, respondFriendRequest, removeFriend } from '../services/friendService'
import { listenReadChapters } from '../services/chapterService'
import ChatIcon from '@mui/icons-material/Chat'
import { Link } from 'react-router-dom'
import { getUserDisplayName } from '../utils/userDisplay'

const FriendsPage: React.FC = () => {
  const { user } = useContext(AuthContext)

  const [incoming, setIncoming] = useState<{ id: string; from: string }[]>([])
  const [outgoing, setOutgoing] = useState<{ id: string; to: string }[]>([])
  const [friends, setFriends] = useState<{ id: string; since: string }[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})

  // search/autocomplete state
  const [searchInput, setSearchInput] = useState('')
  const [options, setOptions] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)

  // Track each friend’s current streak
  const [friendStreaks, setFriendStreaks] = useState<Record<string, number>>({})

  // subscribe to requests and friends
  useEffect(() => {
    if (!user) return
    const unsubInc = listenIncomingRequests(user.uid, setIncoming)
    const unsubOut = listenOutgoingRequests(user.uid, setOutgoing)
    const unsubFr = listenFriendsList(user.uid, setFriends)
    return () => { unsubInc(); unsubOut(); unsubFr() }
  }, [user])

  // fetch profiles for incoming
  useEffect(() => {
    incoming.forEach(req => {
      if (!profiles[req.from]) {
        listenUserProfile(req.from, profile => setProfiles(prev => ({ ...prev, [req.from]: profile })))
      }
    })
  }, [incoming])

  // fetch profiles for outgoing
  useEffect(() => {
    outgoing.forEach(req => {
      if (!profiles[req.to]) {
        listenUserProfile(req.to, profile => setProfiles(prev => ({ ...prev, [req.to]: profile })))
      }
    })
  }, [outgoing])

  // fetch profiles for friends
  useEffect(() => {
    friends.forEach(fr => {
      if (!profiles[fr.id]) {
        listenUserProfile(fr.id, profile => setProfiles(prev => ({ ...prev, [fr.id]: profile })))
      }
    })
  }, [friends])

  // fetch search results
  useEffect(() => {
    if (!searchInput) { setOptions([]); return }
    setLoading(true)
    searchUsersByUsername(searchInput).then(res => {
      setOptions(res)
      setLoading(false)
    })
  }, [searchInput])

  // Subscribe to each friend’s readChapters to compute current streak
  useEffect(() => {
    const unsubs: (() => void)[] = []
    friends.forEach(fr => {
      const unsub = listenReadChapters(fr.id, data => {
        const dates = new Set(Object.values(data).map(d => d.toDateString()));
        let streak = 0;
        let day = new Date();
        while (dates.has(day.toDateString())) {
          streak++;
          day = new Date(day.getTime() - 86400000);
        }
        setFriendStreaks(prev => ({ ...prev, [fr.id]: streak }));
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach(fn => fn());
  }, [friends]);

  const handleSendFriend = async (targetUid: string) => {
    if (!user) return
    await sendFriendRequest(user.uid, targetUid)
    setSelectedUser(null)
    setSearchInput('')
  }

  if (!user) return null
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Friends</Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Autocomplete
          sx={{ flex: 1 }}
          getOptionLabel={(opt) => opt.username || opt.uid}
          options={options}
          loading={loading}
          inputValue={searchInput}
          onInputChange={(_, v) => setSearchInput(v)}
          value={selectedUser}
          onChange={(_, v) => setSelectedUser(v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search users"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Button
          variant="contained"
          disabled={!selectedUser}
          onClick={() => selectedUser && handleSendFriend(selectedUser.uid)}
        >
          Send Request
        </Button>
      </Box>

      {incoming.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Incoming Requests</Typography>
          <List>
            {incoming.map(req => {
              const p = profiles[req.from] || {}
              return (
                <ListItem key={req.id} secondaryAction={
                  <>
                    <Button size="small" onClick={() => respondFriendRequest(user.uid, req.from, true)}>Accept</Button>
                    <Button size="small" onClick={() => respondFriendRequest(user.uid, req.from, false)}>Decline</Button>
                  </>
                }>
                  <ListItemAvatar><Avatar src={p.photoURL} /></ListItemAvatar>
                  <ListItemText primary={getUserDisplayName(profiles[req.from], req.from)} />
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}

      {outgoing.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Outgoing Requests</Typography>
          <List>
            {outgoing.map(req => {
              const p = profiles[req.to] || {}
              return (
                <ListItem key={req.id} secondaryAction={
                  <Button size="small" onClick={() => withdrawFriendRequest(user.uid, req.to)}>Cancel</Button>
                }>
                  <ListItemAvatar><Avatar src={p.photoURL} /></ListItemAvatar>
                  <ListItemText primary={getUserDisplayName(profiles[req.to], req.to)} />
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}

      {friends.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Friends</Typography>
          <List>
            {friends.map(fr => {
              const p = profiles[fr.id] || {}
              return (
                <ListItem key={fr.id} secondaryAction={
                  <>
                    <IconButton size="small" component={Link} to={`/chat/${fr.id}`}>
                      <ChatIcon />
                    </IconButton>
                    <Button size="small" onClick={() => removeFriend(user.uid, fr.id)}>Unfriend</Button>
                  </>
                }>
                  <ListItemAvatar><Avatar src={p.photoURL} /></ListItemAvatar>
                  <ListItemText
                    primary={getUserDisplayName(profiles[fr.id], fr.id)}
                    secondary={`Since ${new Date(fr.since).toLocaleDateString()} | Streak: ${friendStreaks[fr.id] ?? 0}`}
                  />
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}
    </Container>
  )
}

export default FriendsPage
