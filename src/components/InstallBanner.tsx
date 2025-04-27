import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import { isStandalone, captureInstallPrompt, canInstallPWA, promptInstall } from '../pwa-utils';

const BANNER_DISMISSED_KEY = 'pwa-banner-dismissed';
const DISMISS_DURATION_DAYS = 7; // Show again after 7 days

interface InstallBannerProps {
  position?: 'top' | 'bottom';
}

const InstallBanner: React.FC<InstallBannerProps> = ({ position = 'top' }) => {
  const [showBanner, setShowBanner] = useState(false);
  useEffect(() => {
    // Initialize the PWA prompt capture
    captureInstallPrompt();
    
    // Check if the app is already installed
    if (isStandalone()) {
      return;
    }

    // Check if the user has dismissed the banner recently
    const dismissedTime = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedTime) {
      const dismissedDate = new Date(parseInt(dismissedTime));
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        return;
      }
    }

    // Check if we can install and show banner
    if (canInstallPWA()) {
      setShowBanner(true);
    }

    // Listen for pwaInstallReady custom event
    const handleInstallReady = () => {
      setShowBanner(true);
    };

    // Listen for pwaInstalled custom event
    const handleInstalled = () => {
      setShowBanner(false);
    };

    window.addEventListener('pwaInstallReady', handleInstallReady);
    window.addEventListener('pwaInstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwaInstallReady', handleInstallReady);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    try {
      // Trigger the install prompt using our utility function
      const outcome = await promptInstall();
      
      // Hide the banner
      setShowBanner(false);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        // Store the dismissal time
        localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      // Hide the banner if there's an error
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store the dismissal time
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed', // Always use fixed positioning
        top: position === 'top' ? 0 : 'auto',
        bottom: position === 'bottom' ? 0 : 'auto',
        left: 0,
        right: 0,
        zIndex: 1300, // Higher than AppBar and Drawer
        bgcolor: 'primary.dark', // Slightly darker to distinguish from navbar
        color: 'primary.contrastText',
        py: 0.75,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GetAppIcon />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Install VerseVoyage for a better experience
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={handleInstall}
          sx={{
            borderColor: 'primary.contrastText',
            '&:hover': {
              borderColor: 'primary.contrastText',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Install
        </Button>
        <IconButton
          size="small"
          color="inherit"
          onClick={handleDismiss}
          aria-label="Close install banner"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default InstallBanner;
