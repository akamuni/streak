import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Stack, Card, CardContent, Avatar, CardActions, IconButton, Tooltip } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LinkIcon from '@mui/icons-material/Link';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import CreateGroupDialog from '../components/CreateGroupDialog';
import JoinGroupDialog from '../components/JoinGroupDialog';
import { getUserGroups, Group } from '../services/groupService';
import { AuthContext } from '../context/AuthContext';

const GroupsPage: React.FC = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getUserGroups(user.uid);
      setGroups(res);
    } catch (e) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, [user]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <GroupsIcon fontSize="large" />
        <Typography variant="h5">Groups</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
          onClick={() => setOpenCreate(true)}
        >
          Create Group
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ ml: 2 }}
          onClick={() => setOpenJoin(true)}
        >
          Join Group
        </Button>
      </Stack>
      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : groups.length === 0 ? (
        <Typography color="text.secondary">You haven't joined any groups yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {groups.map(group => (
            <Card key={group.id} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
              <Avatar src={group.imageUrl || undefined} sx={{ mr: 2, width: 48, height: 48 }}>
                {!group.imageUrl && <GroupsIcon />}
              </Avatar>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2" color="text.secondary">{group.description}</Typography>
                <Typography variant="caption" color="text.secondary">{group.privacy === 'private' ? 'Private' : 'Public'}</Typography>
              </CardContent>
              <CardActions>
                <Tooltip title="Copy Invite Code">
                  <IconButton onClick={() => navigator.clipboard.writeText(group.inviteToken)}>
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Open Group Chat">
                  <IconButton color="primary" onClick={() => navigate(`/groups/${group.id}/chat`)}>
                    <ChatIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
      <CreateGroupDialog open={openCreate} onClose={() => { setOpenCreate(false); fetchGroups(); }} />
      <JoinGroupDialog open={openJoin} onClose={() => setOpenJoin(false)} onJoined={fetchGroups} />
    </Box>
  );
};

export default GroupsPage;
