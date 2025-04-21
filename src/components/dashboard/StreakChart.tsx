import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { AuthContext } from '../../context/AuthContext'
import { listenReadChapters } from '../../services/chapterService'
import { listenCheatDays } from '../../services/cheatService'

interface Segment { start: Date; end: Date; length: number; readCount: number; cheatCount: number }

const StreakChart: React.FC = () => {
  const { user } = useContext(AuthContext)
  const theme = useTheme()
  const [segments, setSegments] = useState<Segment[]>([])

  useEffect(() => {
    if (!user) return
    let readData: Record<string, Date> = {}
    let cheatData: Record<string, Date> = {}

    const updateSegments = () => {
      const allDates = new Set([
        ...Object.values(readData).map(d => d.toDateString()),
        ...Object.values(cheatData).map(d => d.toDateString()),
      ])
      const dateSet = new Set(allDates)
      const sortedDates = Array.from(allDates)
        .map(ds => new Date(ds))
        .sort((a, b) => a.getTime() - b.getTime())

      const segs: Segment[] = []
      sortedDates.forEach(dateObj => {
        const prevKey = new Date(dateObj.getTime() - 86400000).toDateString()
        if (!dateSet.has(prevKey)) {
          let len = 0, readCnt = 0, cheatCnt = 0
          let current = new Date(dateObj)
          while (dateSet.has(current.toDateString())) {
            const iso = current.toDateString()
            if (cheatData[iso]) cheatCnt++
            else if (readData[iso]) readCnt++
            len++
            current = new Date(current.getTime() + 86400000)
          }
          segs.push({ start: dateObj, end: new Date(current.getTime() - 86400000), length: len, readCount: readCnt, cheatCount: cheatCnt })
        }
      })
      // Sort descending by start date
      setSegments(segs.sort((a, b) => b.start.getTime() - a.start.getTime()))
    }

    const unsubRead = listenReadChapters(user.uid, data => { readData = data; updateSegments() })
    const unsubCheat = listenCheatDays(user.uid, data => { cheatData = data; updateSegments() })
    return () => { unsubRead(); unsubCheat() }
  }, [user])

  const chartData = segments.map(s => ({
    start: s.start.toDateString(),
    readCount: s.readCount,
    cheatCount: s.cheatCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="start"
          tickFormatter={dateStr =>
            new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }
        />
        <YAxis allowDecimals={false} />
        <Tooltip labelFormatter={dateStr => `Start: ${new Date(dateStr).toDateString()}`} />
        <Bar dataKey="readCount" stackId="a" fill={theme.palette.primary.main} />
        <Bar dataKey="cheatCount" stackId="a" fill="grey" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StreakChart
