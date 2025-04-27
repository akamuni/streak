import React, { useState, useContext } from 'react';
import { Fab, Zoom, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { updateChapterRead } from '../../services/chapterService';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from './ToastNotification';

const FloatingActionButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setChapter('');
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!chapter.trim() || !user) return;
    
    setLoading(true);
    try {
      await updateChapterRead(user.uid, chapter, true);
      setSuccess(true);
      showToast(`Marked ${chapter} as read`, 'success');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error marking chapter as read:', error);
      showToast('Failed to mark chapter as read', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Zoom in={true} style={{ transitionDelay: '500ms' }}>
        <Fab 
          color="primary" 
          aria-label="add chapter"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {success ? 'Chapter Marked as Read!' : 'Mark Chapter as Read'}
        </DialogTitle>
        <DialogContent>
          {success ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <Box 
                sx={{ 
                  bgcolor: 'success.light', 
                  borderRadius: '50%', 
                  width: 60, 
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 2
                }}
              >
                <CheckIcon fontSize="large" />
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the chapter you've just completed reading.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Chapter Name"
                fullWidth
                variant="outlined"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g., Chapter 1 or 1 Nephi"
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        {!success && (
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={!chapter.trim() || loading}
            >
              {loading ? 'Marking...' : 'Mark as Read'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default FloatingActionButton;
