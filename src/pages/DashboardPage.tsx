import React, { useContext, useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, Tabs, Tab, Box, Chip, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { AuthContext } from '../context/AuthContext'
import { logout } from '../services/authService'
import ChapterTabs from '../components/dashboard/ChapterTabs'
import StreakChart from '../components/dashboard/StreakChart'
import StreakStats from '../components/dashboard/StreakStats'
import { listenReadChapters, updateChapterRead } from '../services/chapterService'
import { listenCheatDays, updateCheatDay } from '../services/cheatService'
import { format } from 'date-fns'

const DashboardPage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [tab, setTab] = useState(0)
  const [readChapters, setReadChapters] = useState<{ [id: string]: Date }>({})
  const theme = useTheme()
  const [cheatDays, setCheatDays] = useState<Record<string, Date>>({})
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const handleToggleChapter = (id: string, checked: boolean) => {
    if (!user) return
    updateChapterRead(user.uid, id, checked)
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

  const handleToggleCheat = (date: Date | null) => {
    if (!user || !date) return
    const iso = date.toDateString()
    const isCheat = Boolean(cheatDays[iso])
    updateCheatDay(user.uid, date, !isCheat)
    setSelectedDate(date)
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Streaker
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.email}
            </Typography>
            <Typography variant="body1">
              This is your dashboard. Begin by adding or viewing your tasks and notes.
            </Typography>
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
          </>
        )}
      </Container>
    </>
  )
}

export default DashboardPage
