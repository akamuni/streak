import { createContext, useMemo, useState, FC, ReactNode } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

interface ColorModeContextType {
  toggleColorMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
})

export const ColorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
    }),
    [],
  )

  const theme = useMemo(
    () =>
      createTheme({
        spacing: (factor: number) => `${8 * factor}px`,
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          h6: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '0.01em',
          },
          subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '0.01em',
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            letterSpacing: '0.01em',
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
            letterSpacing: '0.01em',
          },
          button: {
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            textTransform: 'none',
          },
          caption: {
            fontSize: '0.75rem',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
          },
          overline: {
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '0.08em',
          },
        },
        palette: {
          mode,
          // Enhanced green palette with better contrast and visual hierarchy
          primary: { 
            dark: '#2d4739',  // Darker green for emphasis
            main: '#4a7c59',  // Vibrant but sophisticated green
            light: '#8fb996', // Lighter green for secondary elements
            contrastText: '#ffffff' 
          },
          secondary: { 
            dark: '#2c4233',
            main: '#3a5a40', 
            light: '#6b9080',
            contrastText: '#ffffff' 
          },
          // Accent colors for highlights, alerts, and special elements
          success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#ffffff'
          },
          error: {
            main: '#e57373',
            light: '#ef9a9a',
            dark: '#d32f2f',
            contrastText: '#ffffff'
          },
          warning: {
            main: '#ffb74d',
            light: '#ffd54f',
            dark: '#f57c00',
            contrastText: '#ffffff'
          },
          info: {
            main: '#64b5f6',
            light: '#90caf9',
            dark: '#1976d2',
            contrastText: '#ffffff'
          },
          // Refined background colors
          background:
            mode === 'light'
              ? { 
                  default: '#f8f9fa', // Slightly off-white for better eye comfort
                  paper: '#ffffff',   // Pure white for cards and elevated surfaces
                }
              : { 
                  default: '#121212', // Dark mode background
                  paper: '#1e1e1e',  // Slightly lighter for cards in dark mode
                },
          // Refined text colors for better readability
          text:
            mode === 'light'
              ? { 
                  primary: '#2d3e35',   // Dark green-gray for primary text
                  secondary: '#5f6e65', // Medium green-gray for secondary text
                  disabled: '#9ea8a2',  // Light green-gray for disabled text
                }
              : { 
                  primary: '#e8e8e8',   // Off-white for primary text in dark mode
                  secondary: '#b0b0b0', // Light gray for secondary text in dark mode
                  disabled: '#6c6c6c',  // Medium gray for disabled text in dark mode
                },
          // Divider colors
          divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          // Action states
          action: {
            active: mode === 'light' ? 'rgba(74, 124, 89, 0.54)' : 'rgba(255, 255, 255, 0.7)',
            hover: mode === 'light' ? 'rgba(74, 124, 89, 0.08)' : 'rgba(255, 255, 255, 0.08)',
            selected: mode === 'light' ? 'rgba(74, 124, 89, 0.16)' : 'rgba(255, 255, 255, 0.16)',
            disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            focus: mode === 'light' ? 'rgba(74, 124, 89, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          },
        },
        shape: {
          borderRadius: 12
        },
        shadows: [
          'none',
          '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
          '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
          '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
          '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
          '0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)',
          '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
          '0px 5px 6px -3px rgba(0,0,0,0.2), 0px 9px 12px 1px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)',
          '0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)',
          '0px 6px 7px -4px rgba(0,0,0,0.2), 0px 11px 15px 1px rgba(0,0,0,0.14), 0px 4px 20px 3px rgba(0,0,0,0.12)',
          '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)',
          '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 13px 19px 2px rgba(0,0,0,0.14), 0px 5px 24px 4px rgba(0,0,0,0.12)',
          '0px 7px 9px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 26px 4px rgba(0,0,0,0.12)',
          '0px 8px 9px -5px rgba(0,0,0,0.2), 0px 15px 22px 2px rgba(0,0,0,0.14), 0px 6px 28px 5px rgba(0,0,0,0.12)',
          '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
          '0px 8px 11px -5px rgba(0,0,0,0.2), 0px 17px 26px 2px rgba(0,0,0,0.14), 0px 6px 32px 5px rgba(0,0,0,0.12)',
          '0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)',
          '0px 9px 12px -6px rgba(0,0,0,0.2), 0px 19px 29px 2px rgba(0,0,0,0.14), 0px 7px 36px 6px rgba(0,0,0,0.12)',
          '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 20px 31px 3px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)',
          '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 21px 33px 3px rgba(0,0,0,0.14), 0px 8px 40px 7px rgba(0,0,0,0.12)',
          '0px 10px 14px -6px rgba(0,0,0,0.2), 0px 22px 35px 3px rgba(0,0,0,0.14), 0px 8px 42px 7px rgba(0,0,0,0.12)',
          '0px 11px 14px -7px rgba(0,0,0,0.2), 0px 23px 36px 3px rgba(0,0,0,0.14), 0px 9px 44px 8px rgba(0,0,0,0.12)',
          '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
          '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 25px 40px 3px rgba(0,0,0,0.14), 0px 9px 48px 8px rgba(0,0,0,0.12)',
        ] as any,
        transitions: {
          easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
          },
          duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195
          }
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              'a, a:visited, a:hover, a:active': {
                color: 'inherit',
                textDecoration: 'none',
                outline: 'none',
              },
              'body': {
                fontFamily: '"Inter", sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }
            },
          },
          MuiTypography: {
            styleOverrides: {
              h1: {
                marginBottom: '0.5em',
              },
              h2: {
                marginBottom: '0.5em',
              },
              h3: {
                marginBottom: '0.5em',
              },
              h4: {
                marginBottom: '0.5em',
              },
              h5: {
                marginBottom: '0.5em',
              },
              h6: {
                marginBottom: '0.5em',
              },
              subtitle1: {
                marginBottom: '0.5em',
              },
              subtitle2: {
                marginBottom: '0.5em',
              },
              body1: {
                marginBottom: '1em',
              },
              body2: {
                marginBottom: '1em',
              },
            },
          },
          MuiButton: {
            defaultProps: { disableRipple: false, disableTouchRipple: false },
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                },
                '&:active': { 
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                },
                '&.Mui-focusVisible': {
                  outline: 'none',
                  boxShadow: `0 0 0 3px ${mode === 'light' ? 'rgba(74, 124, 89, 0.3)' : 'rgba(143, 185, 150, 0.3)'}`,
                },
              },
              contained: {
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                '&.MuiButton-containedPrimary': {
                  background: `linear-gradient(135deg, #4a7c59 0%, #3a5a40 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #4a7c59 10%, #3a5a40 90%)`,
                  }
                },
                '&.MuiButton-containedSecondary': {
                  background: `linear-gradient(135deg, #3a5a40 0%, #2c4233 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #3a5a40 10%, #2c4233 90%)`,
                  }
                },
              },
              outlined: {
                borderWidth: 1.5,
                '&.MuiButton-outlinedPrimary': {
                  borderColor: '#4a7c59',
                  '&:hover': {
                    backgroundColor: 'rgba(74, 124, 89, 0.08)',
                  },
                },
                '&.MuiButton-outlinedSecondary': {
                  borderColor: '#3a5a40',
                  '&:hover': {
                    backgroundColor: 'rgba(58, 90, 64, 0.08)',
                  },
                },
              },
              text: {
                '&.MuiButton-textPrimary': {
                  color: '#4a7c59',
                  '&:hover': {
                    backgroundColor: 'rgba(74, 124, 89, 0.08)',
                  },
                },
                '&.MuiButton-textSecondary': {
                  color: '#3a5a40',
                  '&:hover': {
                    backgroundColor: 'rgba(58, 90, 64, 0.08)',
                  },
                },
              }
            },
          },
          MuiButtonBase: {
            defaultProps: { disableRipple: false, disableTouchRipple: false },
            styleOverrides: {
              root: {
                '&.Mui-focusVisible': {
                  outline: 'none',
                  boxShadow: '0 0 0 3px rgba(88,129,87,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s ease-in-out',
                boxShadow: mode === 'light' 
                  ? '0 4px 20px rgba(0,0,0,0.05)' 
                  : '0 4px 20px rgba(0,0,0,0.2)',
                padding: '24px',  // 3 spacing units
                borderRadius: 12,
                '&:hover': {
                  boxShadow: mode === 'light' 
                    ? '0 8px 24px rgba(0,0,0,0.08)' 
                    : '0 8px 24px rgba(0,0,0,0.3)',
                  transform: 'translateY(-2px)',
                },
                ...(mode === 'dark' && {
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
                }),
              },
              elevation1: {
                boxShadow: mode === 'light' 
                  ? '0 2px 8px rgba(0,0,0,0.05)' 
                  : '0 2px 8px rgba(0,0,0,0.2)',
              },
              elevation2: {
                boxShadow: mode === 'light' 
                  ? '0 4px 12px rgba(0,0,0,0.08)' 
                  : '0 4px 12px rgba(0,0,0,0.25)',
              },
              elevation3: {
                boxShadow: mode === 'light' 
                  ? '0 6px 16px rgba(0,0,0,0.1)' 
                  : '0 6px 16px rgba(0,0,0,0.3)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              },
            },
          },
          MuiCardContent: {
            styleOverrides: {
              root: {
                padding: '24px',
                '&:last-child': {
                  paddingBottom: '24px',
                },
              },
            },
          },
          MuiIconButton: {
            defaultProps: { disableRipple: false, disableTouchRipple: false },
            styleOverrides: {
              root: {
                transition: 'transform 0.2s, background-color 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                transition: 'background-color 0.2s ease-in-out',
                padding: '12px 16px', // 1.5 x 2 spacing units
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(88,129,87,0.08)' : 'rgba(255,255,255,0.05)',
                },
              },
              gutters: {
                paddingLeft: '16px', // 2 spacing units
                paddingRight: '16px', // 2 spacing units
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                transition: 'all 0.2s ease-in-out',
                padding: '12px 16px', // 1.5 x 2 spacing units
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(88,129,87,0.08)' : 'rgba(255,255,255,0.05)',
                },
                '&.Mui-selected': {
                  backgroundColor: mode === 'light' ? 'rgba(88,129,87,0.12)' : 'rgba(88,129,87,0.2)',
                  '&:hover': {
                    backgroundColor: mode === 'light' ? 'rgba(88,129,87,0.18)' : 'rgba(88,129,87,0.25)',
                  },
                },
              },
            },
          },
          MuiList: {
            styleOverrides: {
              root: {
                padding: '8px 0', // 1 spacing unit top/bottom
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                margin: '8px 0', // 1 spacing unit top/bottom
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#588157',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#588157',
                    borderWidth: 2,
                    boxShadow: '0 0 0 3px rgba(88,129,87,0.1)',
                  },
                },
              },
            },
          },
          MuiTouchRipple: {
            styleOverrides: {
              child: {
                backgroundColor: 'currentColor',
              },
            },
          },
          MuiAccordionSummary: {
            defaultProps: { disableRipple: false, disableTouchRipple: false },
            styleOverrides: {
              root: {
                padding: '0 16px', // 0 x 2 spacing units
                minHeight: '48px', // 6 spacing units
                '&.Mui-focusVisible': {
                  outline: 'none',
                  boxShadow: '0 0 0 3px rgba(88,129,87,0.3)',
                  backgroundColor: 'rgba(0,0,0,0)',
                },
              },
              content: {
                margin: '12px 0', // 1.5 spacing units top/bottom
              },
            },
          },
          MuiContainer: {
            styleOverrides: {
              root: {
                paddingTop: '24px', // 3 spacing units
                paddingBottom: '32px', // 4 spacing units
                '@media (min-width: 600px)': {
                  paddingTop: '32px', // 4 spacing units
                  paddingBottom: '40px', // 5 spacing units
                },
                '@media (min-width: 960px)': {
                  paddingTop: '40px', // 5 spacing units
                  paddingBottom: '48px', // 6 spacing units
                },
              },
            },
          },
        },
      }),
    [mode],
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
