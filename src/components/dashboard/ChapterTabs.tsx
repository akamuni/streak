import React, { useState } from 'react'
import { Tabs, Tab, Box, Chip, Typography, LinearProgress } from '@mui/material'
import { books } from '../../data/chapters'

interface ChapterTabsProps {
  readChapters: Record<string, Date>
  onToggle: (id: string, checked: boolean) => void
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ readChapters, onToggle }) => {
  const [bookIndex, setBookIndex] = useState(0)
  const handleBookChange = (_: React.SyntheticEvent, newIndex: number) => {
    setBookIndex(newIndex)
  }

  const book = books[bookIndex]
  const todayStr = new Date().toDateString()

  return (
    <Box>
      <Tabs
        value={bookIndex}
        onChange={handleBookChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {books.map(b => {
          const readCount = Object.keys(readChapters).filter(id => id.startsWith(b.name)).length
          const pct = (readCount / b.count) * 100
          return (
            <Tab
              key={b.name}
              label={
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2">{b.name}</Typography>
                  <Typography variant="caption">{`${readCount}/${b.count}`}</Typography>
                  <LinearProgress variant="determinate" value={pct} sx={{ mt: 0.5 }} />
                </Box>
              }
            />
          )
        })}
      </Tabs>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 1 }}>
        {Array.from({ length: book.count }, (_, i) => {
          const id = `${book.name}-${i + 1}`
          const checked = Boolean(readChapters[id])
          const isToday = checked && readChapters[id].toDateString() === todayStr
          const chipColor = isToday ? 'secondary' : checked ? 'primary' : 'default'
          return (
            <Chip
              key={id}
              label={i + 1}
              clickable
              color={chipColor}
              onClick={() => onToggle(id, !checked)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}

export default ChapterTabs
