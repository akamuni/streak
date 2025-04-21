import React, { useContext, useState, useRef } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { AuthContext } from '../context/AuthContext'
import {
  isUsernameTaken,
  uploadProfilePicture,
  updateUserProfile,
} from '../services/userService'
import { useNavigate } from 'react-router-dom'

const SetupProfilePage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [about, setAbout] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState<string>('')

  if (!user) return null

  const handleUsernameBlur = async () => {
    if (!username) return
    const taken = await isUsernameTaken(username)
    if (taken) {
      setUsernameError('Username taken')
      const suggs = Array.from({ length: 3 }, () =>
        `${username}${Math.floor(Math.random() * 90 + 10)}`
      )
      setSuggestions(suggs)
    } else {
      setUsernameError('')
      setSuggestions([])
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSuggestionClick = (s: string) => {
    setUsername(s)
    setUsernameError('')
    setSuggestions([])
  }

  const handleSubmit = async () => {
    if (!username) {
      setUsernameError('Required')
      return
    }
    if (usernameError) return
    let photoURL: string | undefined
    if (photoFile) photoURL = await uploadProfilePicture(user.uid, photoFile)
    await updateUserProfile(user.uid, {
      username,
      about,
      photoURL,
      gender,
      dateOfBirth,
    })
    navigate('/chapters')
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Complete Your Profile
      </Typography>
      <Box component="form" noValidate>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={handleUsernameBlur}
          error={!!usernameError}
          helperText={usernameError || 'Enter a unique username'}
        />
        {suggestions.map((s) => (
          <Button key={s} onClick={() => handleSuggestionClick(s)}>
            {s}
          </Button>
        ))}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={photoPreview} sx={{ width: 64, height: 64 }} />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handlePhotoChange}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            Upload Picture
          </Button>
        </Box>
        <TextField
          fullWidth
          label="About You"
          multiline
          rows={3}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          sx={{ mt: 2 }}
        />
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            row
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <FormControlLabel
              value="male"
              control={<Radio />}
              label="Male"
            />
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Female"
            />
            <FormControlLabel
              value="other"
              control={<Radio />}
              label="Other"
            />
          </RadioGroup>
        </FormControl>
        <TextField
          fullWidth
          label="Date of Birth"
          type="text"
          placeholder="MM/DD/YYYY"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleSubmit}
        >
          Save Profile
        </Button>
      </Box>
    </Container>
  )
}

export default SetupProfilePage
