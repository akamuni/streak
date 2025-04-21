import React, { useContext, useState, useEffect } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { subDays } from 'date-fns'
import { AuthContext } from '../../context/AuthContext'
import { listenReadChapters } from '../../services/chapterService'
import { listenCheatDays } from '../../services/cheatService'
import { Box, Button } from '@mui/material'

const StreakHeatmap: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [values, setValues] = useState<{ date: string; count: number }[]>([])
  const [view, setView] = useState<'month' | 'year'>('month')

  useEffect(() => {
    if (!user) return
    let readData: Record<string, Date> = {}
    let cheatData: Record<string, Date> = {}

    const updateValues = () => {
      const allDates = new Set([
        ...Object.values(readData).map(d => d.toDateString()),
        ...Object.values(cheatData).map(d => d.toDateString()),
      ])
      const vals = Array.from(allDates).map(dateStr => ({
        date: dateStr,
        count: cheatData[dateStr] ? 2 : 1,
      }))
      setValues(vals)
    }

    const unsubRead = listenReadChapters(user.uid, data => {
      readData = data
      updateValues()
    })
    const unsubCheat = listenCheatDays(user.uid, data => {
      cheatData = data
      updateValues()
    })

    return () => {
      unsubRead()
      unsubCheat()
    }
  }, [user])

  const now = new Date()
  const startDate = view === 'year' ? subDays(now, 364) : new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = now

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant={view === 'month' ? 'contained' : 'outlined'} size="small" onClick={() => setView('month')}>
          Month
        </Button>
        <Button variant={view === 'year' ? 'contained' : 'outlined'} size="small" onClick={() => setView('year')}>
          Year
        </Button>
      </Box>
      <Box sx={{
        overflowX: 'auto',
        maxWidth: { xs: '100%', md: 300 },
        '& .react-calendar-heatmap-day': { width: 6, height: 6 },
        '& .react-calendar-heatmap-month-label': { fontSize: '0.5rem' },
        mb: 2
      }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          gutterSize={1}
          showWeekdayLabels={false}
          showMonthLabels={view === 'year'}
          classForValue={value => {
            if (!value) return 'color-empty'
            return value.count === 2 ? 'color-cheat' : 'color-read'
          }}
        />
      </Box>
    </>
  )
}

export default StreakHeatmap
