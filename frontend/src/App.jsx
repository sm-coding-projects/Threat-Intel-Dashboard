import React, { useState, useEffect } from 'react';
import DashboardPage from './components/DashboardPage';
import SettingsPage from './components/SettingsPage';
import { 
    CssBaseline, Container, Typography, 
    ThemeProvider, Box, AppBar, Toolbar, Button, Chip
} from '@mui/material';
import { Dashboard, Settings, Api } from '@mui/icons-material';
import { darkTheme } from './theme/theme';

function App() {
    const [page, setPage] = useState('dashboard');
    const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || localStorage.getItem('shodanApiKey'));

    useEffect(() => {
        const key = localStorage.getItem('apiKey') || localStorage.getItem('shodanApiKey');
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
            const key = localStorage.getItem('apiKey') || localStorage.getItem('shodanApiKey');
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

    const getApiStatus = () => {
        const shodanKey = localStorage.getItem('shodanApiKey');
        const virusTotalKey = localStorage.getItem('virusTotalApiKey');
        const abuseIPDBKey = localStorage.getItem('abuseIPDBApiKey');
        
        let activeCount = 0;
        if (shodanKey) activeCount++;
        if (virusTotalKey) activeCount++;
        if (abuseIPDBKey) activeCount++;
        
        return activeCount;
    };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ mr: 2 }}>
              Threat Intel Platform
            </Typography>
            <Chip 
              icon={<Api />}
              label={`${getApiStatus()} APIs Active`}
              size="small"
              color={getApiStatus() > 0 ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
                color="inherit" 
                onClick={() => handleNavigation('dashboard')} 
                disabled={!apiKey}
                startIcon={<Dashboard />}
                variant={page === 'dashboard' ? 'outlined' : 'text'}
            >
                Dashboard
            </Button>
            <Button 
                color="inherit" 
                onClick={() => handleNavigation('settings')}
                startIcon={<Settings />}
                variant={page === 'settings' ? 'outlined' : 'text'}
            >
                Settings
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {page === 'dashboard' && apiKey ? <DashboardPage /> : <SettingsPage />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
