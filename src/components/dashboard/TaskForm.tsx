import React, { useState } from 'react'
import { Box, TextField, Button } from '@mui/material'

interface TaskFormProps {
  onAdd: (title: string, description?: string) => void
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title, description || undefined)
    setTitle('')
    setDescription('')
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 2 }}>
      <TextField
        label="Task Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained">
        Add Task
      </Button>
    </Box>
  )
}

export default TaskForm
