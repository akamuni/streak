import React from 'react'
import { List, ListItem, ListItemText, Typography } from '@mui/material'

interface Task {
  id: string
  title: string
  description?: string
}

interface TaskListProps {
  tasks: Task[]
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (!tasks.length) {
    return <Typography>No tasks yet.</Typography>
  }

  return (
    <List>
      {tasks.map(task => (
        <ListItem key={task.id} divider>
          <ListItemText primary={task.title} secondary={task.description} />
        </ListItem>
      ))}
    </List>
  )
}

export default TaskList
