import React, { useContext, useState, useEffect, useRef, useCallback } from 'react'
import { ChangeEvent } from 'react'
import { Container, Typography, Box, Avatar, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, IconButton, Badge, Tooltip } from '@mui/material'
import ProfileStatsCard from '../components/profile/ProfileStatsCard'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import { AuthContext } from '../context/AuthContext'
import { ColorModeContext } from '../context/ColorModeContext'
import { useTheme } from '@mui/material/styles'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

import { listenUserProfile, updateUserProfile, uploadProfilePicture } from '../services/userService'
import { auth, db } from '../firebase'
import { updateEmail as authUpdateEmail, updatePassword as authUpdatePassword, reauthenticateWithCredential, reauthenticateWithPopup, EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

import PictureCropDialog from '../components/profile/PictureCropDialog'
import type { Area } from 'react-easy-crop'

const ProfilePage: React.FC = () => {
  const { user } = useContext(AuthContext)
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)
  const [photoURL, setPhotoURL] = useState<string | undefined>('')
  const [username, setUsername] = useState<string>('')
  // We'll use the same variable for both current and draft values
  // Username state for editing
  const [_, setUsernameDraft] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewURL, setPreviewURL] = useState<string | undefined>(undefined)
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState<string>('');
  // Name state for editing
  const [__, setNameDraft] = useState<string>('');

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => setCroppedArea(croppedPixels), [])

  useEffect(() => {
    if (!user) return
    const unsub = listenUserProfile(user.uid, data => {
      setUsername(data.username || '')
      setUsernameDraft(data.username || '')
      setName(data.name || '')
      setNameDraft(data.name || '')
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
  if (!user) return null

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

  // Removed unused handlers: handleAboutSave, handleUsernameSave, handleNameSave, handleOpenPwd

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

  // Removed unused handlers

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

  // Provider checks
  const hasPasswordProvider = user.providerData.some(p => p.providerId === 'password')
  const hasGoogleProvider = user.providerData.some(p => p.providerId === 'google.com')
  const isGoogleOnly = hasGoogleProvider && !hasPasswordProvider

  // We don't need friend management state in this view anymore since we're navigating to /friends

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

  // Password dialog state setup - these variables are kept for future implementation
  // The handleOpenPwd function was removed as it's not currently used
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

  // Refresh auth user before opening delete dialog
  const handleOpenDelete = async () => {
    setDeletePassword('')
    setDeleteError('')
    if (auth.currentUser) {
      await auth.currentUser.reload()
    }
    setOpenDeleteDialog(true)
  }
  const handleCloseDelete = () => setOpenDeleteDialog(false)
  const handleDeleteAccount = async () => {
    if (!user) return
    try {
      if (isGoogleOnly) {
        // Reauthenticate via Google
        await reauthenticateWithPopup(auth.currentUser!, new GoogleAuthProvider())
      } else {
        // Reauthenticate via password
        const cred = EmailAuthProvider.credential(user.email || '', deletePassword)
        await reauthenticateWithCredential(auth.currentUser!, cred)
      }
      // Soft-delete: mark account pending deletion
      await setDoc(doc(db, 'users', user.uid), {
        deletionRequestedAt: serverTimestamp(),
        status: 'pending_deletion'
      }, { merge: true })
      // Sign out user and inform
      await auth.signOut()
      navigate('/login', { state: { message: 'Account scheduled for deletion in 30 days.' } })
    } catch (e: any) {
      setDeleteError(e.message)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom align="center">Profile</Typography>
      
      {/* Personal Info Card */}
      <Paper elevation={2} sx={{ borderRadius: 3, mb: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">@{username || user.email?.split('@')[0]}</Typography>
              <IconButton 
                onClick={() => updateUserProfile(user.uid, { username: prompt('Enter new username:', username) || username })}
                size="small"
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Tooltip title={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={colorMode.toggleColorMode} size="small">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    onClick={handleUploadClick}
                    sx={{ 
                      bgcolor: 'background.paper', 
                      width: 32, 
                      height: 32,
                      border: '2px solid #fff',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar 
                  src={previewURL || photoURL} 
                  sx={{ 
                    width: 100, 
                    height: 100,
                    border: '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
              </Badge>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
            </Box>
          </Box>
          
          {/* Name */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, mt: 2 }}>
            <Typography variant="h5" fontWeight="500">
              {name || 'Your Name'}
            </Typography>
            <IconButton 
              onClick={() => updateUserProfile(user.uid, { name: prompt('Enter your name:', name) || name })}
              size="small"
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Profile Stats Card */}
          <ProfileStatsCard />
        </Box>
      </Paper>
      
      {/* Account Management */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          mb: 2, 
          overflow: 'hidden',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
          cursor: 'pointer'
        }}
        onClick={handleOpenEmail}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Account Management</Typography>
          <ChevronRightIcon />
        </Box>
      </Paper>
      
      {/* Friends */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          mb: 2, 
          overflow: 'hidden',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
          cursor: 'pointer'
        }}
        onClick={() => navigate('/friends')}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Friends</Typography>
          <ChevronRightIcon />
        </Box>
      </Paper>
      
      {/* Privacy & Notifications */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          mb: 2, 
          overflow: 'hidden',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
          cursor: 'pointer'
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Privacy & Notifications</Typography>
          <ChevronRightIcon />
        </Box>
      </Paper>
      
      {/* Stats & Badges */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          mb: 2, 
          overflow: 'hidden',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
          cursor: 'pointer'
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Stats & Badges</Typography>
          <ChevronRightIcon />
        </Box>
      </Paper>
      

      
      {/* Delete Account */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          mb: 2, 
          overflow: 'hidden',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
          cursor: 'pointer'
        }}
        onClick={handleOpenDelete}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="error">Delete Account</Typography>
          <ChevronRightIcon />
        </Box>
      </Paper>
      <PictureCropDialog
        open={Boolean(previewURL)}
        previewURL={previewURL}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        onCancel={() => { setSelectedFile(null); setPreviewURL(undefined) }}
        onUploadOriginal={async () => { await handleConfirmUpload(); setPreviewURL(undefined) }}
        onCropAndUpload={handleCropAndUpload}
      />
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
          {isGoogleOnly ? (
            <>
              <Typography>Reauthenticate with Google to delete your account. This cannot be undone.</Typography>
              {deleteError && <Typography color="error">{deleteError}</Typography>}
            </>
          ) : (
            <>
              <Typography>Type your password to confirm. This cannot be undone.</Typography>
              {deleteError && <Typography color="error">{deleteError}</Typography>}
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAccount} variant="contained">
            {isGoogleOnly ? 'Delete with Google' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ProfilePage
