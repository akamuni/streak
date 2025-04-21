import React, { useState } from 'react'
import { FormControl, InputLabel, Select, MenuItem, Box, Chip, SelectChangeEvent } from '@mui/material'
import { books } from '../../data/chapters'

interface ChapterGroupProps {
  readChapters: Record<string, Date>
  onToggle: (id: string, checked: boolean) => void
}

const ChapterGroup: React.FC<ChapterGroupProps> = ({ readChapters, onToggle }) => {
  const [selectedBook, setSelectedBook] = useState<string>(books[0].name)

  const handleBookChange = (e: SelectChangeEvent<string>) => {
    setSelectedBook(e.target.value as string)
  }

  const book = books.find(b => b.name === selectedBook)
  const count = book ? book.count : 0

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="book-select-label">Book</InputLabel>
        <Select
          labelId="book-select-label"
          value={selectedBook}
          label="Book"
          onChange={handleBookChange}
        >
          {books.map(b => (
            <MenuItem key={b.name} value={b.name}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {Array.from({ length: count }, (_, i) => i + 1).map(num => {
          const id = `${selectedBook}-${num}`
          const checked = Boolean(readChapters[id])
          return (
            <Chip
              key={id}
              label={num}
              clickable
              color={checked ? 'primary' : 'default'}
              onClick={() => onToggle(id, !checked)}
            />
          )
        })}
      </Box>
    </Box>
  )
}

export default ChapterGroup
