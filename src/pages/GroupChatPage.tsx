import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, TextField, Button, Stack, Avatar, Paper, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { doc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: any;
  reactions?: { [userId: string]: string };
} // reactions: { userId: emoji }


const GroupChatPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢'];

  // Fetch group info and check membership
  useEffect(() => {
    if (!groupId) return;
    const fetchGroup = async () => {
      const groupRef = doc(db, 'groups', groupId);
      const snap = await getDoc(groupRef);
      if (!snap.exists()) {
        setGroup(null);
        setLoading(false);
        return;
      }
      setGroup({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchGroup();
  }, [groupId]);

  // Listen to messages
  useEffect(() => {
    if (!groupId) return;
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      );
    });
    return () => unsub();
  }, [groupId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Group not found.</Typography>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Box>
    );
  }

  const isMember = user && group.members && group.members[user.uid];

  const handleSend = async () => {
    if (!input.trim() || !user || !isMember || !groupId) { 
        return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || 'Unknown',
        content: input.trim(),
        createdAt: serverTimestamp(),
        reactions: {},
      });
      setInput('');
    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  // Reactions
  const handleReact = async (msg: Message, emoji: string) => {
    if (!user || !groupId) return;
    const msgRef = doc(db, 'groups', groupId, 'messages', msg.id);
    const newReactions = { ...(msg.reactions || {}) };
    if (newReactions[user.uid] === emoji) {
      // Toggle off
      delete newReactions[user.uid];
    } else {
      newReactions[user.uid] = emoji;
    }
    await updateDoc(msgRef, { reactions: newReactions });
  };

  // Edit message
  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };
  const saveEdit = async (msg: Message) => {
    if (!user || !groupId || !editValue.trim()) return;
    const msgRef = doc(db, 'groups', groupId, 'messages', msg.id);
    await updateDoc(msgRef, { content: editValue });
    setEditingId(null);
    setEditValue('');
  };

  // Delete message
  const handleDelete = async (msg: Message) => {
    if (!user || !groupId) return;
    const msgRef = doc(db, 'groups', groupId, 'messages', msg.id);
    await deleteDoc(msgRef);
  };


  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h6">{group.name} Chat</Typography>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.100' }}>
        {messages.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>No messages yet. Start the conversation!</Typography>
        ) : (
          messages.map(msg => {
            const isSelf = msg.senderId === user?.uid;
            return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isSelf ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              {!isSelf && <Avatar sx={{ mr: 1, width: 32, height: 32 }}>{msg.senderName?.[0]?.toUpperCase() || '?'}</Avatar>}
              <Paper 
                sx={{
                  p: 1.5, 
                  bgcolor: isSelf ? 'primary.light' : 'white',
                  color: isSelf ? 'primary.contrastText' : 'text.primary',
                  borderRadius: isSelf ? '15px 15px 0 15px' : '15px 15px 15px 0',
                  maxWidth: '75%',
                  position: 'relative',
                  wordBreak: 'break-word',
                }}
              >
                {!isSelf && <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>{msg.senderName || 'Unknown'}</Typography>}
                {editingId === msg.id ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(msg); }}
                      sx={{ flex: 1 }}
                    />
                    <Button onClick={() => saveEdit(msg)} disabled={!editValue.trim()} size="small" color={isSelf ? 'inherit' : 'primary'}>Save</Button>
                    <Button onClick={cancelEdit} size="small" color={isSelf ? 'inherit' : 'secondary'}>Cancel</Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{msg.content}</Typography>
                )}
                <Typography variant="caption" color={isSelf ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', textAlign: 'right', fontSize: '0.7rem' }}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                </Typography>
                {/* Reactions UI - Needs styling adjustments too if desired */}
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                  {REACTION_EMOJIS.map(emoji => {
                    const count = Object.values(msg.reactions || {}).filter(r => r === emoji).length;
                    const reacted = user && msg.reactions && msg.reactions[user.uid] === emoji;
                    return (
                      <Button
                        key={emoji}
                        size="small"
                        variant={reacted ? 'contained' : 'text'}
                        onClick={() => handleReact(msg, emoji)}
                        sx={{ minWidth: 'auto', px: 0.8, py: 0.2, lineHeight: 1.2, fontSize: '0.8rem' }}
                      >
                        {emoji}{count > 0 ? ` ${count}` : ''}
                      </Button>
                    );
                  })}
                </Box>
                {/* Edit/Delete controls for sender */}
                {isSelf && (
                  <Box sx={{ display: 'flex', gap: 0.5, position: 'absolute', top: 4, right: 4, opacity: 0.7 }}>
                    {editingId !== msg.id && (
                      <IconButton size="small" onClick={() => startEdit(msg)} sx={{ color: 'primary.contrastText' }}><EditIcon fontSize="inherit" /></IconButton>
                    )}
                    <IconButton size="small" color="inherit" onClick={() => handleDelete(msg)} sx={{ color: 'primary.contrastText' }}><DeleteIcon fontSize="inherit" /></IconButton>
                  </Box>
                )}
              </Paper>
            </Box>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </Box>
      {isMember ? (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={sending}
          />
          <IconButton color="primary" onClick={handleSend} disabled={sending || !input.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography color="error">You must be a member to send messages.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default GroupChatPage;
