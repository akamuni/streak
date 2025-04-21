import React from 'react'
import { List, ListItem, ListItemText, Checkbox, ListItemIcon } from '@mui/material'
import { chapters, Chapter } from '../../data/chapters'

interface ChapterListProps {
  readChapters: { [id: string]: Date }
  onToggle: (id: string, checked: boolean) => void
}

const ChapterList: React.FC<ChapterListProps> = ({ readChapters, onToggle }) => (
  <List>
    {chapters.map((ch: Chapter) => (
      <ListItem key={ch.id} divider>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={!!readChapters[ch.id]}
            onChange={e => onToggle(ch.id, e.target.checked)}
            inputProps={{ 'aria-labelledby': `chapter-checkbox-${ch.id}` }}
          />
        </ListItemIcon>
        <ListItemText
          id={`chapter-checkbox-${ch.id}`}
          primary={ch.title}
        />
      </ListItem>
    ))}
  </List>
)

export default ChapterList
