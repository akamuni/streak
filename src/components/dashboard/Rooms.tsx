import React, { useContext, useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import { AuthContext } from '../../context/AuthContext'
import { createRoom, listenUserRooms, joinRoom, Room } from '../../services/roomService'

const Rooms: React.FC = () => {
  const { user } = useContext(AuthContext)
  const [rooms, setRooms] = useState<Room[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!user) return
    const unsub = listenUserRooms(user.uid, setRooms)
    return () => unsub()
  }, [user])

  const handleCreate = async () => {
    if (!user || !name) return
    await createRoom(name, description, user.uid)
    setName('')
    setDescription('')
  }

  const handleJoin = async (roomId: string) => {
    if (!user) return
    await joinRoom(roomId, user.uid)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Create a Book Club</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleCreate} disabled={!name}>
          Create
        </Button>
      </Box>
      <Typography variant="h6" gutterBottom>Your Rooms</Typography>
      <List>
        {rooms.map(room => (
          <ListItem
            key={room.id}
            secondaryAction={
              !room.members.includes(user!.uid) && (
                <Button variant="outlined" onClick={() => handleJoin(room.id)}>
                  Join
                </Button>
              )
            }
          >
            <ListItemText
              primary={room.name}
              secondary={`${room.description || ''} (${room.members.length} members)`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default Rooms
