import React, { useState, useEffect } from 'react'
import { Tabs, Tab, Box, List, ListItem, ListItemButton, ListItemText, Checkbox, Typography, LinearProgress, Card, CardContent, CardActionArea, Chip, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DoneIcon from '@mui/icons-material/Done'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { books } from '../../data/chapters'
import gospelLinks from '../../data/Gospel Library App Links.json'
import { UserProfile } from '../../services/userService';

interface ChapterTabsProps {
  readChapters: Record<string, Date>
  onToggle: (id: string, checked: boolean) => void
  userProfile?: UserProfile | null;
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ readChapters, onToggle, userProfile }) => {
  const [bookIndex, setBookIndex] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (userProfile?.lastReadBook) {
      const lastReadBookIndex = books.findIndex(b => b.name === userProfile.lastReadBook);
      if (lastReadBookIndex !== -1) {
        setBookIndex(lastReadBookIndex);
      } else {
        setBookIndex(0); // Default if book not found (e.g., name mismatch)
      }
    } else {
      setBookIndex(0); // Default if no profile or lastReadBook
    }
  }, [userProfile]); // Re-run when userProfile changes

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
      <Box sx={{ 
        overflowX: 'auto', 
        bgcolor: theme.palette.background.paper,
        borderRadius: { xs: 2, md: 3 },
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        mb: 3
      }}>
        <Tabs
          value={bookIndex}
          onChange={handleBookChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            px: 1,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          {books.map((b) => {
            const readCount = Object.keys(readChapters).filter((id) => id.startsWith(b.name)).length
            const pct = (readCount / b.count) * 100
            return (
              <Tab
                key={b.name}
                label={
                  <Box sx={{ textAlign: 'center', width: isMobile ? 80 : 120 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {b.name}
                    </Typography>
                    <Typography variant="caption">{`${readCount}/${b.count}`}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ 
                        mt: 0.5, 
                        height: 4, 
                        borderRadius: 2,
                        bgcolor: `${theme.palette.primary.main}15`,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                }
              />
            )
          })}
        </Tabs>
      </Box>

      {/* Mobile List View */}
      {isMobile ? (
        <List 
          disablePadding 
          sx={{ 
            mt: 2, 
            width: '100%',
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          {Array.from({ length: book.count }, (_, i) => {
            const index = i + 1
            const id = `${book.name}-${index}`
            const checked = Boolean(readChapters[id])
            return (
              <ListItem 
                key={id} 
                disablePadding 
                divider={i < book.count - 1}
                sx={{
                  bgcolor: checked ? `${theme.palette.primary.main}10` : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <ListItemButton onClick={() => handleChapterClick(index)}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={checked ? 600 : 400}>
                        {`Chapter ${index}`}
                      </Typography>
                    }
                    secondary={checked ? `Read on ${readChapters[id].toLocaleDateString()}` : undefined}
                  />
                  <Checkbox
                    edge="end"
                    checked={checked}
                    color="primary"
                    onClick={e => { e.stopPropagation(); onToggle(id, !checked) }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      ) : (
        /* Desktop/Tablet Card Grid View */
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          {Array.from({ length: book.count }, (_, i) => {
            const index = i + 1
            const id = `${book.name}-${index}`
            const checked = Boolean(readChapters[id])
            const readDate = checked ? new Date(readChapters[id]) : null;
            
            return (
              <Box key={id}>
                <Card 
                  elevation={1}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid',
                    borderColor: checked ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                    ...(checked && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 1,
                      }
                    })
                  }}
                >
                  {checked && (
                    <DoneIcon 
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        color: 'white',
                        fontSize: '0.9rem',
                        zIndex: 2,
                      }} 
                    />
                  )}
                  
                  <CardActionArea 
                    onClick={() => handleChapterClick(index)}
                    sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      p: 0,
                    }}
                  >
                    <CardContent sx={{ width: '100%', p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {`Chapter ${index}`}
                        </Typography>
                        <MenuBookIcon color={checked ? 'primary' : 'action'} />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        {checked ? (
                          <Chip 
                            label={`Read on ${readDate?.toLocaleDateString()}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<DoneIcon />}
                            sx={{ borderRadius: 1 }}
                          />
                        ) : (
                          <Chip 
                            label="Mark as read"
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggle(id, true);
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default ChapterTabs
