import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Typography, Slider } from '@mui/material'
import Cropper, { Area } from 'react-easy-crop'

export type PictureCropDialogProps = {
  open: boolean
  previewURL?: string
  crop: { x: number; y: number }
  zoom: number
  onCropChange: (crop: { x: number; y: number }) => void
  onZoomChange: (zoom: number) => void
  onCropComplete: (croppedArea: Area, pixelCrop: Area) => void
  onCancel: () => void
  onUploadOriginal: () => Promise<void>
  onCropAndUpload: () => void
}

const PictureCropDialog: React.FC<PictureCropDialogProps> = ({
  open,
  previewURL,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onUploadOriginal,
  onCropAndUpload,
}) => (
  <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
    <DialogTitle>Crop Picture</DialogTitle>
    <DialogContent>
      <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
        {previewURL && (
          <Cropper
            image={previewURL}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        )}
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Zoom</Typography>
        <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, v) => onZoomChange(v as number)} />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="outlined" onClick={onUploadOriginal}>Upload Original</Button>
      <Button variant="contained" onClick={onCropAndUpload}>Crop & Upload</Button>
    </DialogActions>
  </Dialog>
)

export default PictureCropDialog
