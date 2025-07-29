import React, { useState, useEffect } from 'react';
import DashboardPage from './components/DashboardPage';
import SettingsPage from './components/SettingsPage';
import { 
    CssBaseline, Container, Typography, createTheme, 
    ThemeProvider, Box, AppBar, Toolbar, Button 
} from '@mui/material';
import { blueGrey, grey } from '@mui/material/colors';
import { Dashboard, Settings } from '@mui/icons-material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#64b5f6', // A lighter blue for primary actions
        },
        background: {
            default: '#1a1a1a',
            paper: '#242424',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0bec5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            letterSpacing: '0.05em',
        },
        h5: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    border: `1px solid ${grey[800]}`,
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: grey[900],
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 'bold',
                }
            }
        }
    }
});

function App() {
    const [page, setPage] = useState('dashboard');
    const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey'));

    useEffect(() => {
        const key = localStorage.getItem('apiKey');
        setApiKey(key);
        if (!key) {
            setPage('settings');
        }
    }, []);

    const handleNavigation = (newPage) => {
        setPage(newPage);
    };
    
    // This effect will listen for changes in localStorage and update the apiKey state
    useEffect(() => {
        const handleStorageChange = () => {
            const key = localStorage.getItem('apiKey');
            setApiKey(key);
            if (!key) {
                setPage('settings');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Threat Intel Platform
          </Typography>
          <Button 
              color="inherit" 
              onClick={() => handleNavigation('dashboard')} 
              disabled={!apiKey}
              startIcon={<Dashboard />}
          >
              Dashboard
          </Button>
          <Button 
              color="inherit" 
              onClick={() => handleNavigation('settings')}
              startIcon={<Settings />}
          >
              Settings
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {page === 'dashboard' && apiKey ? <DashboardPage /> : <SettingsPage />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
