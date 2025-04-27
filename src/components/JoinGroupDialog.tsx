import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { joinGroupByInviteCode } from '../services/groupService';
import { AuthContext } from '../context/AuthContext';

interface JoinGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}

const JoinGroupDialog: React.FC<JoinGroupDialogProps> = ({ open, onClose, onJoined }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in.');
      await joinGroupByInviteCode(inviteCode.trim(), user.uid);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setInviteCode('');
        onClose();
        onJoined();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to join group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Join a Group</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Invite Code"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            required
            fullWidth
            margin="normal"
            disabled={loading}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Joined group!</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={!inviteCode.trim() || loading} startIcon={loading ? <CircularProgress size={18} /> : null}>
            {loading ? 'Joining...' : 'Join'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JoinGroupDialog;
