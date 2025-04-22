import React, { useState } from 'react'
import { Tabs, Tab, Box, Chip, Typography, LinearProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { books } from '../../data/chapters'

interface ChapterTabsProps {
  readChapters: Record<string, Date>
  onToggle: (id: string, checked: boolean) => void
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ readChapters, onToggle }) => {
  const [bookIndex, setBookIndex] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleBookChange = (_: React.SyntheticEvent, newIndex: number) => {
    setBookIndex(newIndex)
  }

  const book = books[bookIndex]
  const todayStr = new Date().toDateString()

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Scrollable Tabs */}
      <Box sx={{ overflowX: 'auto' }}>
        <Tabs
          value={bookIndex}
          onChange={handleBookChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 1 }}
        >
          {books.map((b) => {
            const readCount = Object.keys(readChapters).filter((id) => id.startsWith(b.name)).length
            const pct = (readCount / b.count) * 100
            return (
              <Tab
                key={b.name}
                label={
                  <Box sx={{ textAlign: 'center', width: isMobile ? 80 : 120 }}>
                    <Typography variant="body2" noWrap>
                      {b.name}
                    </Typography>
                    <Typography variant="caption">{`${readCount}/${b.count}`}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    />
                  </Box>
                }
              />
            )
          })}
        </Tabs>
      </Box>

      <Box sx={{
        mt: 2,
        display: 'flex',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        overflowX: isMobile ? 'auto' : 'visible',
        gap: 1,
        px: 1,
        '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {Array.from({ length: book.count }, (_, i) => {
          const id = `${book.name}-${i + 1}`;
          const checked = Boolean(readChapters[id]);
          const isToday = checked && readChapters[id].toDateString() === todayStr;
          const chipColor = isToday ? 'secondary' : checked ? 'primary' : 'default';
          return (
            <Chip
              key={id}
              label={i + 1}
              clickable
              onClick={() => onToggle(id, !checked)}
              color={chipColor}
              size="small"
            />
          );
        })}
      </Box>
    </Box>
  )
}

export default ChapterTabs
