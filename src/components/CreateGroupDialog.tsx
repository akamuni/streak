import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Avatar,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { createGroup } from '../services/groupService';
import { AuthContext } from '../context/AuthContext';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => setImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a group.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        privacy,
        imageUrl: image || '',
        createdBy: user.uid
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setDescription('');
        setPrivacy('public');
        setImage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create a New Group</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack alignItems="center" spacing={2} mb={2}>
            <Avatar src={image || undefined} sx={{ width: 64, height: 64 }}>
              {!image && <GroupsIcon fontSize="large" />}
            </Avatar>
            <Button variant="outlined" component="label" size="small">
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
          </Stack>
          <TextField
            label="Group Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
            margin="normal"
            disabled={loading}
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            margin="normal"
            disabled={loading}
          />
          <FormLabel component="legend" sx={{ mt: 2 }}>
            Privacy
          </FormLabel>
          <RadioGroup
            row
            value={privacy}
            onChange={e => setPrivacy(e.target.value as 'public' | 'private')}
          >
            <FormControlLabel value="public" control={<Radio />} label="Public" disabled={loading} />
            <FormControlLabel value="private" control={<Radio />} label="Private" disabled={loading} />
          </RadioGroup>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Group created!</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={!name.trim() || loading} startIcon={loading ? <CircularProgress size={18} /> : null}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateGroupDialog;
