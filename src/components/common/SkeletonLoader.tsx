import React from 'react';
import { Skeleton, Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'profile' | 'chapter' | 'text';
  count?: number;
  width?: string | number;
  height?: string | number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 1,
  width,
  height
}) => {
  const theme = useTheme();

  const renderCardSkeleton = () => (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(45deg, #2a3a4a 30%, #3a4a5a 90%)' 
          : 'linear-gradient(45deg, #f5f5f5 30%, #eeeeee 90%)'
      }}
    >
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="text" width="30%" height={36} />
        <Skeleton variant="text" width="20%" height={36} />
      </Box>
    </Paper>
  );

  const renderListSkeleton = () => (
    <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {[...Array(count)].map((_, i) => (
        <Box 
          key={i} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: i < count - 1 ? `1px solid ${theme.palette.divider}` : 'none'
          }}
        >
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Paper>
  );

  const renderProfileSkeleton = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="text" width="50%" height={32} sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width="70%" height={24} sx={{ mx: 'auto', mb: 3 }} />
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
      </Paper>
    </Box>
  );

  const renderChapterSkeleton = () => (
    <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Skeleton variant="text" width="30%" height={28} />
        <Skeleton variant="text" width="20%" height={28} />
      </Box>
      {[...Array(count)].map((_, i) => (
        <Box 
          key={i} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: i < count - 1 ? `1px solid ${theme.palette.divider}` : 'none'
          }}
        >
          <Box>
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      ))}
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Paper>
  );

  const renderTextSkeleton = () => {
    return (
      <Skeleton 
        variant="text" 
        width={width || '100%'} 
        height={height || 24} 
        sx={{ borderRadius: 1, mb: 1 }} 
      />
    );
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'profile':
        return renderProfileSkeleton();
      case 'chapter':
        return renderChapterSkeleton();
      case 'text':
        return renderTextSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  if (type === 'card' && count > 1) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {[...Array(count)].map((_, i) => (
          <Box key={i}>
            {renderCardSkeleton()}
          </Box>
        ))}
      </Box>
    );
  }

  return renderSkeleton();
};

export default SkeletonLoader;
