import React, { useContext, useState, useEffect, useMemo } from 'react'
import { Typography, Container, Card, CardContent, Tabs, Tab, Box, Chip, Stack, List, ListItem, ListItemAvatar, Avatar, ListItemText, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { AuthContext } from '../context/AuthContext'

import ChapterTabs from '../components/dashboard/ChapterTabs'
import StreakChart from '../components/dashboard/StreakChart'
import StreakStats from '../components/dashboard/StreakStats'
import { listenReadChapters, updateChapterRead } from '../services/chapterService'
import { listenCheatDays, updateCheatDay } from '../services/cheatService'
import { listenFriendsList } from '../services/friendService'
import { getConversationId, sendMessage } from '../services/chatService'
import { listenUserProfile, UserProfile } from '../services/userService'
import { format } from 'date-fns'
import Rooms from '../components/dashboard/Rooms'

const DashboardPage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [tab, setTab] = useState(0)
  const [readChapters, setReadChapters] = useState<{ [id: string]: Date }>({})
  const theme = useTheme()
  const [cheatDays, setCheatDays] = useState<Record<string, Date>>({})
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [friendIds, setFriendIds] = useState<string[]>([])
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({})
  const [friendReadData, setFriendReadData] = useState<Record<string, Record<string, Date>>>({})
  const [friendStreaks, setFriendStreaks] = useState<Record<string, number>>({})
  const [page, setPage] = useState(1)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const itemsPerPage = 5
  const sortedFriends = Object.entries(friendStreaks).sort(([,a], [,b]) => b - a)
  const totalPages = Math.ceil(sortedFriends.length / itemsPerPage)
  const pagedFriends = sortedFriends.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    if (!user) {
      setReadChapters({})
      return
    }
    const unsubscribe = listenReadChapters(user.uid, data => setReadChapters(data))
    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsubCheat = listenCheatDays(user.uid, data => setCheatDays(data))
    return () => unsubCheat()
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsub = listenFriendsList(user.uid, list => setFriendIds(list.map(f => f.id)))
    return unsub
  }, [user])

  useEffect(() => {
    const unsubs: (() => void)[] = []
    friendIds.forEach(fid => {
      if (!friendProfiles[fid]) {
        const unsub = listenUserProfile(fid, prof => setFriendProfiles(prev => ({ ...prev, [fid]: prof })))
        unsubs.push(unsub)
      }
    })
    return () => unsubs.forEach(u => u())
  }, [friendIds])

  useEffect(() => {
    const unsubs: (() => void)[] = []
    friendIds.forEach(fid => {
      const unsub = listenReadChapters(fid, data => setFriendReadData(prev => ({ ...prev, [fid]: data })))
      unsubs.push(unsub)
    })
    return () => unsubs.forEach(u => u())
  }, [friendIds])

  useEffect(() => {
    const streaks: Record<string, number> = {}
    Object.entries(friendReadData).forEach(([fid, data]) => {
      const dateSet = new Set(Object.values(data).map(d => d.toDateString()))
      let cnt = 0
      let day = new Date()
      while (dateSet.has(day.toDateString())) {
        cnt++
        day = new Date(day.getTime() - 86400000)
      }
      streaks[fid] = cnt
    })
    setFriendStreaks(streaks)
  }, [friendReadData])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const handleToggleChapter = (id: string, checked: boolean) => {
    if (!user) return
    updateChapterRead(user.uid, id, checked)
    setReadChapters(prev => {
      const updated = { ...prev }
      if (checked) {
        updated[id] = new Date()
      } else {
        delete updated[id]
      }
      return updated
    })
    if (checked) {
      const msg = `Just read chapter ${id}.`
      friendIds.forEach(fid => {
        const convo = getConversationId(user.uid, fid)
        sendMessage(convo, user.uid, msg)
      })
    }
  }

  const computeStreak = () => {
    const dates = new Set([
      ...Object.values(readChapters).map(d => d.toDateString()),
      ...Object.values(cheatDays).map(d => d.toDateString()),
    ])
    let streak = 0
    let day = new Date()
    while (dates.has(day.toDateString())) {
      streak++
      day = new Date(day.getTime() - 86400000)
    }
    return streak
  }

  const streak = React.useMemo(computeStreak, [readChapters, cheatDays])

  const lastReadChapter = useMemo(() => {
    let last: string | null = null;
    let lastTime = 0;
    Object.entries(readChapters).forEach(([id, date]) => {
      const t = date.getTime();
      if (t > lastTime) { lastTime = t; last = id; }
    });
    return last;
  }, [readChapters]);

  const handleToggleCheat = (date: Date | null) => {
    if (!user || !date) return
    const iso = date.toDateString()
    const isCheat = Boolean(cheatDays[iso])
    updateCheatDay(user.uid, date, !isCheat)
    setSelectedDate(date)
  }

  return (
    <>

      <Container sx={{
        mt: 4,
        width: '100%',
        maxWidth: { sm: 'md' },
        boxSizing: 'border-box',
        px: { xs: 0.5, sm: 2 },
      }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.email}
            </Typography>
            {lastReadChapter ? (
              <Typography variant="body1">You're on {lastReadChapter}!</Typography>
            ) : (
              <Typography variant="body1">You haven't started reading yet.</Typography>
            )}
            <Typography variant="body1">🔥 {streak}-day streak!</Typography>
          </CardContent>
        </Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 2 }}>
          <Tab label="Chapters" />
          <Tab label="Streak" />
        </Tabs>
        {tab === 0 && (
          <ChapterTabs readChapters={readChapters} onToggle={handleToggleChapter} />
        )}
        {tab === 1 && (
          <>
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h5">
                  Current Streak: {streak} {streak === 1 ? 'day' : 'days'}
                </Typography>
              </CardContent>
            </Card>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Calendar</Typography>
              <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                <Calendar
                  value={selectedDate}
                  onClickDay={(date) => { handleToggleCheat(date); setSelectedDate(date) }}
                  tileClassName={({ date, view }) => {
                    if (view === 'month') {
                      const iso = date.toDateString();
                      if (cheatDays[iso]) return 'cheat-day';
                      if (readChapters[iso]) return 'read-day';
                      if (date < new Date()) return 'missed-day';
                    }
                    return '';
                  }}
                />
              </Box>
              {/* Legend */}
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Legend:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                  <Typography variant="caption">Read Day</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'grey' }} />
                  <Typography variant="caption">Cheat Day</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'red' }} />
                  <Typography variant="caption">Missed Day</Typography>
                </Box>
              </Box>
              {/* Planned Cheat Days */}
              {Object.keys(cheatDays).length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Planned Cheat Days:</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {Object.keys(cheatDays).map(iso => (
                      <Chip
                        key={iso}
                        label={format(new Date(iso), 'MMM d')}
                        onDelete={() => user && updateCheatDay(user.uid, new Date(iso), false)}
                        color="secondary"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Streak Chart</Typography>
              <StreakChart />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Streak History</Typography>
              <StreakStats />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Friends Leaderboard</Typography>
              <List>
                {pagedFriends.map(([fid, st], idx) => {
                  const rank = (page - 1) * itemsPerPage + idx + 1
                  const prof = friendProfiles[fid] || {}
                  return (
                    <ListItem key={fid}
                      sx={{ bgcolor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'inherit', cursor: 'pointer' }}
                      onClick={() => setSelectedFriend(fid)}
                    >
                      <ListItemAvatar><Avatar src={prof.photoURL} /></ListItemAvatar>
                      <ListItemText
                        primary={`${rank}. ${prof.username || fid}`}
                        secondary={`Streak: ${st} ${st === 1 ? 'day' : 'days'}`}
                      />
                    </ListItem>
                  )
                })}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" />
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Book Clubs</Typography>
              <Rooms />
            </Box>
          </>
        )}
      </Container>
      {/* Friend Profile Dialog */}
      <Dialog open={!!selectedFriend} onClose={() => setSelectedFriend(null)}>
        <DialogTitle>Friend Profile</DialogTitle>
        <DialogContent>
          <Typography>Name: {selectedFriend ? (friendProfiles[selectedFriend]?.name || 'N/A') : ''}</Typography>
          <Typography>Username: {selectedFriend ? `@${friendProfiles[selectedFriend]?.username || ''}` : ''}</Typography>
          <Typography>Streak: {selectedFriend ? (friendStreaks[selectedFriend] || 0) : 0} days</Typography>
          <Typography>Current Chapter: {selectedFriend ? (() => {
            const chs = Object.keys(friendReadData[selectedFriend] || {})
            return chs.length ? chs.sort()[chs.length - 1] : 'None'
          })() : ''}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFriend(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DashboardPage
