import React, { useContext, useState, useEffect, useMemo } from 'react'
import { Typography, Container, Card, CardContent, Tabs, Tab, Box, Chip, Stack, Dialog, Button, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { AuthContext } from '../context/AuthContext'
import SkeletonLoader from '../components/common/SkeletonLoader'
import { useToast } from '../components/common/ToastNotification'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import InfoIcon from '@mui/icons-material/Info'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { listenReadChapters, updateChapterRead } from '../services/chapterService'
import { listenCheatDays, updateCheatDay } from '../services/cheatService'
import { listenFriendsList } from '../services/friendService'
import { listenUserProfile, UserProfile } from '../services/userService'
import { format } from 'date-fns'
import Rooms from '../components/dashboard/Rooms'
import ChapterTabs from '../components/dashboard/ChapterTabs'
import StreakChart from '../components/dashboard/StreakChart'
import StreakStats from '../components/dashboard/StreakStats'

interface SelectedFriendProfile extends UserProfile {
  id: string;
}

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
  const [selectedFriend, setSelectedFriend] = useState<SelectedFriendProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { showToast } = useToast()

  // Calculate streak function
  const calculateStreak = (chapters: { [id: string]: Date }, cheatDays: Record<string, Date>) => {
    if (!Object.keys(chapters).length) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toDateString()

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    const dates = Object.values(chapters).map(d => {
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      return date.toDateString()
    })
    const dateSet = new Set(dates)

    // If read today, streak is at least 1
    if (dateSet.has(todayStr)) {
      let streak = 1
      let currentDate = yesterday
      
      while (true) {
        const dateStr = currentDate.toDateString()
        if (dateSet.has(dateStr) || cheatDays[dateStr]) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
      
      return streak
    }
    
    // If read yesterday but not today, streak is still active
    if (dateSet.has(yesterdayStr)) {
      let streak = 1
      let currentDate = new Date(yesterday)
      currentDate.setDate(currentDate.getDate() - 1)
      
      while (true) {
        const dateStr = currentDate.toDateString()
        if (dateSet.has(dateStr) || cheatDays[dateStr]) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
      
      return streak
    }
    
    return 0
  }

  // Calculate last read chapter for display
  const lastReadChapter = useMemo(() => {
    const chapters = Object.keys(readChapters)
    return chapters.length ? chapters.sort()[chapters.length - 1] : null
  }, [readChapters])

  // Calculate streak
  const streak = useMemo(() => calculateStreak(readChapters, cheatDays), [readChapters, cheatDays])

  useEffect(() => {
    if (!user) {
      setReadChapters({})
      return
    }
    setLoading(true)
    const unsubscribe = listenReadChapters(user.uid, data => {
      setReadChapters(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsubCheat = listenCheatDays(user.uid, data => setCheatDays(data))
    return () => unsubCheat()
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsub = listenFriendsList(user.uid, list => setFriendIds(list.map(f => f.id)))
    return () => unsub()
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
  }, [friendIds, friendProfiles])

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
      streaks[fid] = calculateStreak(data, {}) // Friends don't have cheat days in this view
    })
    setFriendStreaks(streaks)
  }, [friendReadData])

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = listenUserProfile(user.uid, (profile) => {
        setUserProfile(profile);
        // Consider setting loading to false here if profile is essential before rendering
      });
      return () => unsubscribeProfile();
    } else {
      setUserProfile(null); // Reset profile on logout
    }
  }, [user]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const handleToggleChapter = (id: string, checked: boolean) => {
    if (!user) return
    try {
      updateChapterRead(user.uid, id, checked)
      showToast(
        checked ? `Marked ${id} as read` : `Unmarked ${id} as read`, 
        checked ? 'success' : 'info'
      )
    } catch (error) {
      console.error('Error updating chapter:', error)
      showToast('Failed to update chapter status', 'error')
    }
  }

  const handleToggleCheat = (date: Date | null) => {
    if (!user || !date) return
    try {
      const iso = date.toDateString()
      const isCheat = Boolean(cheatDays[iso])
      updateCheatDay(user.uid, date, !isCheat)
      if (!isCheat) {
        showToast(`Added cheat day for ${format(date, 'MMM d, yyyy')}`, 'success')
      } else {
        showToast(`Removed cheat day for ${format(date, 'MMM d, yyyy')}`, 'info')
      }
      setSelectedDate(date)
    } catch (error) {
      console.error('Error updating cheat day:', error)
      showToast('Failed to update cheat day', 'error')
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Container>
        {/* Welcome Card */}
        <Card 
          elevation={2}
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
                Welcome, {user?.email}
              </Typography>
              
              {!loading && (
                <Chip 
                  icon={<span role="img" aria-label="fire">🔥</span>} 
                  label={`${streak}-day streak`}
                  color="primary"
                  sx={{ 
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 1,
                    '& .MuiChip-icon': { 
                      mr: 0.5,
                      ml: -0.5,
                    }
                  }}
                />
              )}
            </Box>
            
            {loading ? (
              <SkeletonLoader type="text" width="60%" />
            ) : lastReadChapter ? (
              <Box sx={{ 
                p: 2, 
                bgcolor: `${theme.palette.primary.main}10`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <MenuBookIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body1" fontWeight={500}>
                  You're currently on <strong>{lastReadChapter}</strong>
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                p: 2, 
                bgcolor: `${theme.palette.info.light}20`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="body1">You haven't started reading yet. Select a chapter to begin!</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation Tabs */}
        <Box sx={{ 
          mb: 3,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <Tabs 
            value={tab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                py: 1.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                }
              }
            }}
          >
            <Tab label="Chapters" icon={<MenuBookIcon />} iconPosition="start" />
            <Tab label="Streak & Stats" icon={<ShowChartIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        {loading ? (
          tab === 0 ? (
            <SkeletonLoader type="chapter" count={5} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <SkeletonLoader type="card" />
              <SkeletonLoader type="list" count={3} />
            </Box>
          )
        ) : tab === 0 ? (
          <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 0 }}>
              <ChapterTabs 
                readChapters={readChapters} 
                onToggle={handleToggleChapter}
                userProfile={userProfile} // Pass userProfile down
              />
            </CardContent>
          </Card>
        ) : (
          <> 
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Left Column - Streak Stats */}
              <Box>
                <Card 
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    mb: 3,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      bgcolor: 'primary.main',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ShowChartIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.75rem' }} />
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {streak} {streak === 1 ? 'Day' : 'Days'}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Keep up the great work! Your consistent reading habit is building a strong foundation.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'background.default', 
                        borderRadius: 2,
                        minWidth: 100,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {Object.keys(readChapters).length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Chapters Read
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'background.default', 
                        borderRadius: 2,
                        minWidth: 100,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {Object.keys(cheatDays).length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cheat Days
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Streak Chart</Typography>
                    <StreakChart />
                  </CardContent>
                </Card>
                
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Streak History</Typography>
                    <StreakStats />
                  </CardContent>
                </Card>
              </Box>
              
              {/* Right Column - Calendar & Friends */}
              <Box>
                <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Reading Calendar</Typography>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.background.default, 
                      borderRadius: 2,
                      '.react-calendar': {
                        width: '100%',
                        border: 'none',
                        borderRadius: 2,
                        fontFamily: 'inherit',
                        lineHeight: 1.5,
                      },
                      '.react-calendar__tile': {
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                      },
                      '.react-calendar__tile--active': {
                        background: `${theme.palette.primary.main}80`,
                      },
                      '.react-calendar__tile:enabled:hover': {
                        background: `${theme.palette.primary.main}20`,
                      },
                      '.read-day': {
                        background: `${theme.palette.primary.main}40`,
                        color: theme.palette.primary.dark,
                        fontWeight: 'bold',
                      },
                      '.cheat-day': {
                        background: `${theme.palette.secondary.light}40`,
                      },
                      '.missed-day': {
                        color: theme.palette.error.main,
                        textDecoration: 'line-through',
                        opacity: 0.7,
                      }
                    }}>
                      <Calendar
                        value={selectedDate}
                        onClickDay={(date) => { handleToggleCheat(date) }}
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
                    
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                      <Chip 
                        size="small" 
                        icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                        label="Read Day"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                      <Chip 
                        size="small" 
                        icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.light' }} />}
                        label="Cheat Day"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                      <Chip 
                        size="small" 
                        icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />}
                        label="Missed Day"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    
                    {Object.keys(cheatDays).length > 0 && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Planned Cheat Days:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                          {Object.keys(cheatDays).map(iso => (
                            <Chip
                              key={iso}
                              label={format(new Date(iso), 'MMM d')}
                              onDelete={() => user && updateCheatDay(user.uid, new Date(iso), false)}
                              color="secondary"
                              size="small"
                              sx={{ borderRadius: 1, my: 0.5 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
            <Card sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Book Clubs</Typography>
                <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2 }}>
                  <Rooms />
                </Box>
              </CardContent>
            </Card>
          </>
        )}
        {/* Friend Profile Dialog */}
        <Dialog
          open={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          {selectedFriend && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedFriend.username}'s Profile
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                Streak: {friendStreaks[selectedFriend.id] || 0} days
              </Typography>
              {/* Add more friend details here if needed */}
              <Button
                variant="contained"
                onClick={() => setSelectedFriend(null)}
                sx={{ mt: 2 }}
              >
                Close
              </Button>
            </Box>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}

export default DashboardPage
