import React, { useState } from 'react'
import { Tabs, Tab, Box, List, ListItem, ListItemButton, ListItemText, Checkbox, Typography, LinearProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { books } from '../../data/chapters'
import gospelLinks from '../../data/Gospel Library App Links.json'

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

  const handleChapterClick = (index: number) => {
    const id = `${book.name}-${index}`
    onToggle(id, true)
    const entry = (gospelLinks as any[]).find(l => l.book === book.name && l.chapter === index)
    if (!entry) {
      console.warn(`No deep link mapping for ${book.name} chapter ${index}`)
      return
    }
    // open in-app link, then fallback to website
    window.location.href = entry.gospelLink
    setTimeout(() => window.open(entry.fallbackUrl, '_blank'), 500)
  }

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

      <List disablePadding sx={{ mt: 2, width: '100%' }}>
        {Array.from({ length: book.count }, (_, i) => {
          const index = i + 1
          const id = `${book.name}-${index}`
          const checked = Boolean(readChapters[id])
          return (
            <ListItem key={id} disablePadding>
              <ListItemButton onClick={() => handleChapterClick(index)}>
                <ListItemText
                  primary={`Chapter ${index}`}
                  secondary={checked ? `Read on ${readChapters[id].toLocaleDateString()}` : undefined}
                />
                <Checkbox
                  edge="end"
                  checked={checked}
                  onClick={e => { e.stopPropagation(); onToggle(id, !checked) }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

export default ChapterTabs
