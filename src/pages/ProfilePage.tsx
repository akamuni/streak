import React, { useContext, useState, useEffect, useRef, useCallback } from 'react'
import { ChangeEvent } from 'react'
import { Container, Typography, Box, Avatar, Button, TextField, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { AuthContext } from '../context/AuthContext'
import { ColorModeContext } from '../context/ColorModeContext'
import { useTheme } from '@mui/material/styles'
import { listenUserProfile, updateUserProfile, uploadProfilePicture } from '../services/userService'
import { auth } from '../firebase'
import { updateEmail as authUpdateEmail, updatePassword as authUpdatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { sendFriendRequest, withdrawFriendRequest, listenIncomingRequests, listenOutgoingRequests, listenFriendsList, respondFriendRequest, removeFriend } from '../services/friendService'
import Cropper, { Area } from 'react-easy-crop'
import Slider from '@mui/material/Slider'

const ProfilePage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const theme = useTheme()
  const { toggleColorMode } = useContext(ColorModeContext)
  if (!user) return null
  const [about, setAbout] = useState<string>('')
  const [photoURL, setPhotoURL] = useState<string | undefined>('')
  const [username, setUsername] = useState<string>('')
  const [editingUsername, setEditingUsername] = useState<boolean>(false)
  const [usernameDraft, setUsernameDraft] = useState<string>(username)
  const [editingAbout, setEditingAbout] = useState<boolean>(false)
  const [aboutDraft, setAboutDraft] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewURL, setPreviewURL] = useState<string | undefined>(undefined)
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => setCroppedArea(croppedPixels), [])

  useEffect(() => {
    if (!user) return
    const unsub = listenUserProfile(user.uid, data => {
      setUsername(data.username || '')
      setUsernameDraft(data.username || '')
      setAbout(data.about || '')
      setPhotoURL(data.photoURL)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewURL(undefined)
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewURL(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
      setPreviewURL(undefined)
    }
  }, [selectedFile])

  const navigate = useNavigate()

  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return
    setSelectedFile(e.target.files[0])
  }

  async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = new Image()
    image.src = imageSrc
    await new Promise(resolve => { image.onload = resolve })
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is null')
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg'))
  }

  const handleConfirmUpload = async () => {
    if (!user || !selectedFile) return
    const url = await uploadProfilePicture(user.uid, selectedFile)
    setPhotoURL(url)
    setSelectedFile(null)
  }

  const handleCropAndUpload = async () => {
    console.log('Crop & Upload clicked', { previewURL, croppedArea })
    try {
      if (!previewURL) throw new Error('No previewURL available')
      // if user hasn't adjusted crop, upload full image
      if (!croppedArea) {
        console.log('No crop area, uploading full image')
        await handleConfirmUpload()
        // close crop dialog
        setPreviewURL(undefined)
        return
      }
      console.log('Cropping area', croppedArea)
      const blob = await getCroppedImg(previewURL, croppedArea)
      const file = new File([blob], selectedFile?.name || 'cropped.jpg', { type: 'image/jpeg' })
      console.log('Uploading cropped file', file)
      const url = await uploadProfilePicture(user.uid, file)
      console.log('Upload succeeded, URL:', url)
      setPhotoURL(url)
      setSelectedFile(null)
      setPreviewURL(undefined)
    } catch (err: any) {
      console.error('Crop & Upload error:', err)
      alert(`Upload failed: ${err.message}`)
    }
  }

  const handleAboutSave = async () => {
    if (!user) return
    await updateUserProfile(user.uid, { about: aboutDraft })
    setAbout(aboutDraft)
    setEditingAbout(false)
  }
  const handleUsernameSave = async () => {
    if (!user) return
    await updateUserProfile(user.uid, { username: usernameDraft })
    setUsername(usernameDraft)
    setEditingUsername(false)
  }

  // Account management dialog state
  const [openEmailDialog, setOpenEmailDialog] = useState(false)
  const [emailNew, setEmailNew] = useState(user?.email || '')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailError, setEmailError] = useState('')

  const [openPwdDialog, setOpenPwdDialog] = useState(false)
  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdError, setPwdError] = useState('')

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // Friend management state
  const [incomingReqs, setIncomingReqs] = useState<{ id: string; from: string }[]>([])
  const [outgoingReqs, setOutgoingReqs] = useState<{ id: string; to: string }[]>([])
  const [friendsList, setFriendsList] = useState<{ id: string; since: string }[]>([])
  const [friendId, setFriendId] = useState('')

  useEffect(() => {
    if (!user) return
    const unsubInc = listenIncomingRequests(user.uid, setIncomingReqs)
    const unsubOut = listenOutgoingRequests(user.uid, setOutgoingReqs)
    const unsubFr = listenFriendsList(user.uid, setFriendsList)
    return () => { unsubInc(); unsubOut(); unsubFr() }
  }, [user])

  // Handlers
  const handleOpenEmail = () => { setEmailNew(user?.email || ''); setEmailPassword(''); setEmailError(''); setOpenEmailDialog(true) }
  const handleCloseEmail = () => setOpenEmailDialog(false)
  const handleEmailSave = async () => {
    if (!user) return
    try {
      const cred = EmailAuthProvider.credential(user.email || '', emailPassword)
      await reauthenticateWithCredential(auth.currentUser!, cred)
      await authUpdateEmail(auth.currentUser!, emailNew)
      setOpenEmailDialog(false)
    } catch (e: any) { setEmailError(e.message) }
  }

  const handleOpenPwd = () => { setPwdCurrent(''); setPwdNew(''); setPwdConfirm(''); setPwdError(''); setOpenPwdDialog(true) }
  const handleClosePwd = () => setOpenPwdDialog(false)
  const handlePwdSave = async () => {
    if (!user) return
    if (pwdNew !== pwdConfirm) { setPwdError('Passwords do not match'); return }
    try {
      const cred = EmailAuthProvider.credential(user.email || '', pwdCurrent)
      await reauthenticateWithCredential(auth.currentUser!, cred)
      await authUpdatePassword(auth.currentUser!, pwdNew)
      setOpenPwdDialog(false)
    } catch (e: any) { setPwdError(e.message) }
  }

  const handleOpenDelete = () => { setDeletePassword(''); setDeleteError(''); setOpenDeleteDialog(true) }
  const handleCloseDelete = () => setOpenDeleteDialog(false)
  const handleDeleteAccount = async () => {
    if (!user) return
    try {
      const cred = EmailAuthProvider.credential(user.email || '', deletePassword)
      await reauthenticateWithCredential(auth.currentUser!, cred)
      await deleteUser(auth.currentUser!)
      navigate('/login')
    } catch (e: any) { setDeleteError(e.message) }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Box sx={{ my: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Personal Info</Typography></AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar key={previewURL || photoURL} src={previewURL || photoURL} sx={{ width: 64, height: 64 }} />
              <Button variant="outlined" onClick={handleUploadClick}>Change Picture</Button>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
            </Box>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              {editingUsername ? (
                <>
                  <TextField
                    size="small"
                    value={usernameDraft}
                    onChange={e => setUsernameDraft(e.target.value)}
                  />
                  <Button size="small" onClick={handleUsernameSave}>Save</Button>
                  <Button size="small" onClick={() => { setEditingUsername(false); setUsernameDraft(username); }}>Cancel</Button>
                </>
              ) : (
                <>
                  <Typography variant="h6">{username || user.email}</Typography>
                  <Button variant="text" size="small" onClick={() => setEditingUsername(true)}>Edit</Button>
                </>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="About me"
                multiline
                rows={3}
                variant="outlined"
                value={editingAbout ? aboutDraft : about}
                onChange={(e) => setAboutDraft(e.target.value)}
                disabled={!editingAbout}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              {editingAbout ? (
                <>
                  <Button onClick={() => { setEditingAbout(false); setAboutDraft(about); }}>Cancel</Button>
                  <Button variant="contained" onClick={handleAboutSave}>Save</Button>
                </>
              ) : (
                <Button variant="text" onClick={() => { setEditingAbout(true); setAboutDraft(about); }}>Edit</Button>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Account Management</Typography></AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem><ListItemText primary="Change Email" /><Button variant="text" onClick={handleOpenEmail}>Edit</Button></ListItem>
              <ListItem><ListItemText primary="Change Password" /><Button variant="text" onClick={handleOpenPwd}>Edit</Button></ListItem>
              <Divider />
              <ListItem><ListItemText primary="Delete Account" /><Button color="error" variant="outlined" onClick={handleOpenDelete}>Delete</Button></ListItem>
              <ListItem><Button variant="contained" color="primary" fullWidth onClick={() => navigate('/signout')}>Sign Out</Button></ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Friends</Typography></AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField label="Friend UID" size="small" value={friendId} onChange={e => setFriendId(e.target.value)} />
              <Button variant="contained" disabled={!friendId} onClick={() => sendFriendRequest(user.uid, friendId)}>
                Send Request
              </Button>
            </Box>
            {incomingReqs.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Incoming Requests</Typography>
                {incomingReqs.map(req => (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography>{req.from}</Typography>
                    <Button size="small" onClick={() => respondFriendRequest(user.uid, req.from, true)}>Accept</Button>
                    <Button size="small" onClick={() => respondFriendRequest(user.uid, req.from, false)}>Decline</Button>
                  </Box>
                ))}
              </Box>
            )}
            {outgoingReqs.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Outgoing Requests</Typography>
                {outgoingReqs.map(req => (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography>{req.to}</Typography>
                    <Button size="small" onClick={() => withdrawFriendRequest(user.uid, req.to)}>Cancel</Button>
                  </Box>
                ))}
              </Box>
            )}
            {friendsList.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Friends</Typography>
                {friendsList.map(f => (
                  <Box key={f.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography>{f.id}</Typography>
                    <Button size="small" onClick={() => removeFriend(user.uid, f.id)}>Unfriend</Button>
                  </Box>
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Privacy & Notifications</Typography></AccordionSummary>
          <AccordionDetails>
            <FormControlLabel control={<Switch />} label="Public Profile" />
            <FormControlLabel control={<Switch />} label="Email Notifications" />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Stats & Badges</Typography></AccordionSummary>
          <AccordionDetails>
            <Typography>Coming soon...</Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Appearance & Misc</Typography></AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={theme.palette.mode === 'dark'}
                  onChange={toggleColorMode}
                />
              }
              label="Dark Mode"
            />
            <Button variant="text">Send Feedback</Button>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Dialog open={Boolean(previewURL)} onClose={() => { setSelectedFile(null); setPreviewURL(undefined) }}>
        <DialogTitle>Crop Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
            <Cropper
              image={previewURL!}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Zoom</Typography>
            <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, v) => setZoom(v as number)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedFile(null); setPreviewURL(undefined) }}>Cancel</Button>
          <Button variant="outlined" onClick={async () => { await handleConfirmUpload(); setPreviewURL(undefined); }}>Upload Original</Button>
          <Button variant="contained" onClick={handleCropAndUpload}>Crop & Upload</Button>
        </DialogActions>
      </Dialog>
      {/* Change Email Dialog */}
      <Dialog open={openEmailDialog} onClose={handleCloseEmail}>
        <DialogTitle>Change Email</DialogTitle>
        <DialogContent>
          {emailError && <Typography color="error">{emailError}</Typography>}
          <TextField margin="dense" label="New Email" type="email" fullWidth value={emailNew} onChange={e => setEmailNew(e.target.value)} />
          <TextField margin="dense" label="Current Password" type="password" fullWidth value={emailPassword} onChange={e => setEmailPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmail}>Cancel</Button>
          <Button onClick={handleEmailSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Change Password Dialog */}
      <Dialog open={openPwdDialog} onClose={handleClosePwd}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {pwdError && <Typography color="error">{pwdError}</Typography>}
          <TextField margin="dense" label="Current Password" type="password" fullWidth value={pwdCurrent} onChange={e => setPwdCurrent(e.target.value)} />
          <TextField margin="dense" label="New Password" type="password" fullWidth value={pwdNew} onChange={e => setPwdNew(e.target.value)} />
          <TextField margin="dense" label="Confirm Password" type="password" fullWidth value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePwd}>Cancel</Button>
          <Button onClick={handlePwdSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Account Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDelete}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>Type your password to confirm. This cannot be undone.</Typography>
          {deleteError && <Typography color="error">{deleteError}</Typography>}
          <TextField margin="dense" label="Password" type="password" fullWidth value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAccount} variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ProfilePage
