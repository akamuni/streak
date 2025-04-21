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
        palette: {
          mode,
          primary: { dark: '#344e41', main: '#588157', light: '#a3b18a', contrastText: '#dad7cd' },
          secondary: { main: '#3a5a40', contrastText: '#dad7cd' },
          background:
            mode === 'light'
              ? { default: '#dad7cd', paper: '#a3b18a' }
              : { default: '#121212', paper: '#1d1d1d' },
          text:
            mode === 'light'
              ? { primary: '#344e41', secondary: '#3a5a40' }
              : { primary: '#fff', secondary: '#bbb' },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              'a, a:visited, a:hover, a:active': {
                color: 'inherit',
                textDecoration: 'none',
                outline: 'none',
              },
            },
          },
          MuiButton: {
            defaultProps: { disableRipple: true, disableTouchRipple: true },
            styleOverrides: {
              root: {
                '&:hover': { backgroundColor: 'rgba(0,0,0,0)' },
                '&:active': { backgroundColor: 'rgba(0,0,0,0)' },
                '&.Mui-focusVisible': {
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'rgba(0,0,0,0)',
                },
              },
            },
          },
          MuiButtonBase: {
            defaultProps: { disableRipple: true, disableTouchRipple: true },
            styleOverrides: {
              root: {
                '&.Mui-focusVisible': {
                  backgroundColor: 'rgba(0,0,0,0)',
                  outline: 'none',
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiIconButton: {
            defaultProps: { disableRipple: true, disableTouchRipple: true },
          },
          MuiTouchRipple: {
            styleOverrides: {
              child: {
                backgroundColor: 'currentColor',
              },
            },
          },
          MuiAccordionSummary: {
            defaultProps: { disableRipple: true, disableTouchRipple: true },
            styleOverrides: {
              root: {
                '&.Mui-focusVisible': {
                  outline: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'rgba(0,0,0,0)',
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
