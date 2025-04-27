import React, { useEffect, useState, useContext } from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { listenReadChapters } from '../../services/chapterService';
import { useNavigate } from 'react-router-dom';

interface ProfileStatsCardProps {}

const ProfileStatsCard: React.FC<ProfileStatsCardProps> = () => {
  const { user } = useContext(AuthContext);
  const [streak, setStreak] = useState<number>(0);
  const [lastRead, setLastRead] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsub = listenReadChapters(user.uid, (data) => {
      const chapterIds = Object.keys(data);
      if (chapterIds.length > 0) {
        // Find the most recently read chapter
        const sorted = chapterIds.sort((a, b) => data[b].getTime() - data[a].getTime());
        setCurrentChapter(sorted[0]);
        setLastRead(data[sorted[0]].toLocaleDateString());
      } else {
        setCurrentChapter('');
        setLastRead('');
      }
      // Compute streak
      const dates = new Set(Object.values(data).map((d) => d.toDateString()));
      let streakCount = 0;
      
      // Get today and yesterday
      let today = new Date();
      const todayString = today.toDateString();
      
      // Check if today is already marked as read
      const isTodayRead = dates.has(todayString);
      
      // If today is not read yet, start checking from yesterday
      // This gives the user the full current day to maintain their streak
      let day = isTodayRead ? today : new Date(today.getTime() - 86400000);
      
      // Count consecutive days backward from the starting point
      while (dates.has(day.toDateString())) {
        streakCount++;
        day = new Date(day.getTime() - 86400000);
      }
      
      setStreak(streakCount);
    });
    return () => unsub();
  }, [user]);

  return (
    <Paper elevation={2} sx={{ borderRadius: 4, p: 3, mb: 2, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Streak at the top, centered */}
        <Typography variant="h5" fontWeight="bold" sx={{ textAlign: 'center', mb: 2 }}>
          <span role="img" aria-label="streak">🔥</span> {streak}-day streak
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">Current chapter</Typography>
          <Typography variant="body1" fontWeight="bold">{currentChapter || '-'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">Last read</Typography>
          <Typography variant="body1">{lastRead || '-'}</Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{ mt: 2, borderRadius: 2 }}
          onClick={() => navigate('/chapters')}
        >
          View reading history
        </Button>
      </Box>
    </Paper>
  );
};

export default ProfileStatsCard;
