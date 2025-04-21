import React, { useContext, useState, useEffect, useMemo } from 'react'
import { Container, Card, CardContent, Typography, Checkbox, FormControlLabel, Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { listenReadChapters } from '../services/chapterService'
import { listenCheatDays, updateCheatDay } from '../services/cheatService'
import StreakChart from '../components/dashboard/StreakChart'
import StreakStats from '../components/dashboard/StreakStats'

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [readChapters, setReadChapters] = useState<Record<string, Date>>({})
  const [cheatDays, setCheatDays] = useState<Record<string, Date>>({})

  useEffect(() => {
    if (!user) return
    const unsubChapters = listenReadChapters(user.uid, data => setReadChapters(data))
    const unsubCheats = listenCheatDays(user.uid, data => setCheatDays(data))
    return () => {
      unsubChapters()
      unsubCheats()
    }
  }, [user])

  // Combine read and cheat days for streak calculations
  const allDatesSet = new Set([
    ...Object.values(readChapters).map(d => d.toDateString()),
    ...Object.values(cheatDays).map(d => d.toDateString()),
  ])

  // Compute current consecutive-day streak
  const computeStreak = (dates: Set<string>) => {
    let streak = 0
    let day = new Date()
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

  // Determine last read chapter by most recent date
  const lastReadChapter = useMemo(() => {
    let last: string | null = null
    let lastTime = 0
    Object.entries(readChapters).forEach(([id, date]) => {
      const t = date.getTime()
      if (t > lastTime) { lastTime = t; last = id }
    })
    return last
  }, [readChapters])

  const todayStr = new Date().toDateString()
  const isCheatToday = Boolean(cheatDays[todayStr])
  const handleCheatToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    updateCheatDay(user.uid, new Date(), e.target.checked)
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
      }}>
        <Card>
          <CardContent>
            <Typography variant="h5">Current Streak: {currentStreak} days</Typography>
            <Typography variant="h6">Longest Streak: {longest} days</Typography>
            <FormControlLabel
              control={<Checkbox checked={isCheatToday} onChange={handleCheatToggle} />}
              label="Add cheat day (today)"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h5">Continue Reading</Typography>
            {lastReadChapter ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Where you left off: {lastReadChapter}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }}>
                You haven't started reading yet.
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/chapters')}
              >
                Go to Chapters
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Streak Chart
        </Typography>
        <StreakChart />
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Streak History
        </Typography>
        <StreakStats />
      </Box>
    </Container>
  )
}

export default HomePage
