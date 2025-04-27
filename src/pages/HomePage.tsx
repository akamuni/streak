import React, { useContext, useState, useEffect } from 'react'
import { Container, Typography, Box, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Grid, Divider, Chip, IconButton, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { AuthContext } from '../context/AuthContext'
import { listenReadChapters } from '../services/chapterService'
import { listenCheatDays } from '../services/cheatService'
import { listenFriendsList } from '../services/friendService'
import { listenUserProfile, UserProfile } from '../services/userService'
import { getUserDisplayName } from '../utils/userDisplay'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupIcon from '@mui/icons-material/Group'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { format } from 'date-fns'

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const theme = useTheme()
  const [readChapters, setReadChapters] = useState<Record<string, Date>>({})
  const [cheatDays, setCheatDays] = useState<Record<string, Date>>({})
  const [friendIds, setFriendIds] = useState<string[]>([])
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({})
  const [friendReadData, setFriendReadData] = useState<Record<string, Record<string, Date>>>({})
  const [friendStreaks, setFriendStreaks] = useState<Record<string, number>>({})
  const [page, setPage] = useState(1)
  const itemsPerPage = 5
  const sortedFriends = Object.entries(friendStreaks).sort(([,a], [,b]) => b - a)
  const totalPages = Math.ceil(sortedFriends.length / itemsPerPage)
  const pagedFriends = sortedFriends.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    if (!user) return
    const unsubChapters = listenReadChapters(user.uid, data => setReadChapters(data))
    const unsubCheats = listenCheatDays(user.uid, data => setCheatDays(data))
    return () => {
      unsubChapters()
      unsubCheats()
    }
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

  // Combine read and cheat days for streak calculations
  const allDatesSet = new Set([
    ...Object.values(readChapters).map(d => d.toDateString()),
    ...Object.values(cheatDays).map(d => d.toDateString()),
  ])

  // Compute current consecutive-day streak
  const computeStreak = (dates: Set<string>) => {
    let streak = 0
    let today = new Date()
    const todayString = today.toDateString()
    
    // Check if today is already marked as read
    const isTodayRead = dates.has(todayString)
    
    // If today is not read yet, start checking from yesterday
    // This gives the user the full current day to maintain their streak
    let day = isTodayRead ? today : new Date(today.getTime() - 86400000)
    
    // Count consecutive days backward from the starting point
    while (dates.has(day.toDateString())) {
      streak++
      day = new Date(day.getTime() - 86400000)
    }
    
    return streak
  }
  const currentStreak = computeStreak(allDatesSet)

  // Compute longest streak
  const datesArray = Array.from(allDatesSet).map(ds => new Date(ds)).sort((a, b) => a.getTime() - b.getTime())
  let longest = 0
  const dateSet = allDatesSet
  datesArray.forEach(dateObj => {
    const prev = new Date(dateObj.getTime() - 86400000).toDateString()
    if (!dateSet.has(prev)) {
      // start of sequence
      let len = 0
      let d = new Date(dateObj)
      while (dateSet.has(d.toDateString())) {
        len++
        d = new Date(d.getTime() + 86400000)
      }
      longest = Math.max(longest, len)
    }
  })

  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  // Determine reading activity for the last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    return {
      date: date,
      read: allDatesSet.has(dateStr),
      isCheat: Boolean(cheatDays[dateStr])
    };
  }).reverse();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Welcome back!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {formattedDate}
        </Typography>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Streak Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 4, 
              p: 3, 
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #2a3a4a 30%, #3a4a5a 90%)' 
                : 'linear-gradient(45deg, #e8f5e9 30%, #c8e6c9 90%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalFireDepartmentIcon sx={{ color: '#ff7043', mr: 1, fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">Your Streak</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {currentStreak}
                </Typography>
                <Typography variant="body2">Current Streak</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="secondary">
                  {longest}
                </Typography>
                <Typography variant="body2">Longest Streak</Typography>
              </Box>
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Last 7 Days</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              {last7Days.map((day, i) => (
                <Tooltip 
                  key={i} 
                  title={format(day.date, 'EEE, MMM d')}
                  placement="top"
                >
                  <Box 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: day.read 
                        ? day.isCheat ? 'grey.400' : 'primary.main'
                        : 'grey.200',
                      color: day.read ? 'white' : 'text.disabled',
                      border: day.date.toDateString() === today.toDateString() 
                        ? '2px solid' 
                        : 'none',
                      borderColor: 'secondary.main'
                    }}
                  >
                    {format(day.date, 'dd')}
                  </Box>
                </Tooltip>
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/chapters')}
                endIcon={<ArrowForwardIcon />}
              >
                View Details
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Reading Progress Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 4, 
              p: 3,
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #2a3a4a 30%, #3a4a5a 90%)' 
                : 'linear-gradient(45deg, #e3f2fd 30%, #bbdefb 90%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Chapters</Typography>
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/chapters')}
              >
                View All
              </Button>
            </Box>

            <Box sx={{ mb: 2, maxHeight: 320, overflow: 'auto' }}>
              {Object.entries(readChapters).length > 0 ? (
                Object.entries(readChapters)
                  .sort((a, b) => {
                    // Extract chapter numbers and compare
                    const numA = parseInt(a[0].match(/\d+/)?.[0] || '0');
                    const numB = parseInt(b[0].match(/\d+/)?.[0] || '0');
                    return numA - numB;
                  })
                  .slice(0, 7) // Show first 7 chapters
                  .map(([id, date]) => {
                    const chapterMatch = id.match(/Chapter (\d+)/) || id.match(/(\d+)/);
                    const chapterNum = chapterMatch ? chapterMatch[1] : id;
                    const formattedDate = format(date, 'M/d/yyyy');
                    
                    return (
                      <Box 
                        key={id}
                        sx={{
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            {chapterNum} NEPHI
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Read on {formattedDate}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: '#4caf50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}>
                          ✓
                        </Box>
                      </Box>
                    );
                  })
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't read any chapters yet.
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/chapters')}
                fullWidth
              >
                Continue Reading
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Friends Leaderboard */}
        <Grid size={{ xs: 12 }}> 
          <Paper elevation={2} sx={{ borderRadius: 4, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EmojiEventsIcon sx={{ color: '#ffc107', mr: 1, fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">Leaderboard</Typography>
            </Box>
            
            <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              {pagedFriends.length > 0 ? (
                pagedFriends.map(([fid, st]) => {
                  const rank = (page - 1) * itemsPerPage + pagedFriends.indexOf([fid, st]) + 1;
                  const prof = friendProfiles[fid] || {};
                  
                  return (
                    <React.Fragment key={fid}>
                      <ListItem 
                        sx={{ 
                          py: 1.5,
                          borderLeft: rank <= 3 ? '4px solid' : 'none',
                          borderLeftColor: 
                            rank === 1 ? '#ffd700' : 
                            rank === 2 ? '#c0c0c0' : 
                            rank === 3 ? '#cd7f32' : 'transparent'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%',
                            bgcolor: 
                              rank === 1 ? '#ffd700' : 
                              rank === 2 ? '#c0c0c0' : 
                              rank === 3 ? '#cd7f32' : 'grey.300',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            color: rank <= 3 ? 'black' : 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {rank}
                        </Box>
                        <ListItemAvatar>
                          <Avatar src={prof.photoURL} />
                        </ListItemAvatar>
                        <ListItemText 
                          primary={getUserDisplayName(prof, fid)}
                          secondary={`${st} day streak`}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                        <Chip 
                          label={`${st} 🔥`}
                          size="small"
                          color={rank <= 3 ? 'primary' : 'default'}
                          variant={rank <= 3 ? 'filled' : 'outlined'}
                        />
                      </ListItem>
                      {pagedFriends.indexOf([fid, st]) < pagedFriends.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  );
                })
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No friends yet" 
                    secondary="Add friends to see them on the leaderboard"
                  />
                </ListItem>
              )}
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Button 
                startIcon={<GroupIcon />}
                onClick={() => navigate('/friends')}
                size="small"
              >
                Manage Friends
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  &lt;
                </IconButton>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  {page} / {Math.max(1, totalPages)}
                </Typography>
                <IconButton 
                  size="small"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                >
                  &gt;
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default HomePage
