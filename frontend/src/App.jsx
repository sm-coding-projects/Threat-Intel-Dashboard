import React, { useState, useEffect } from 'react';
import DashboardPage from './components/DashboardPage';
import SettingsPage from './components/SettingsPage';
import { 
    CssBaseline, Container, Typography, 
    ThemeProvider, Box, AppBar, Toolbar, Button, Chip
} from '@mui/material';
import { Dashboard, Settings, Api } from '@mui/icons-material';
import { darkTheme } from './theme/theme';
import { useNavigationState } from './hooks/useApiKeyState';
import { getApiKeyCount } from './utils/apiKeyUtils';

function App() {
    // Use the new navigation state hook for real-time updates
    const { 
        currentPage, 
        canNavigate, 
        hasValidKey, 
        navigateTo,
        setCurrentPage 
    } = useNavigationState();
    
    // Local state for API key count (updates in real-time)
    const [apiKeyCount, setApiKeyCount] = useState(0);

    // Update API key count when state changes
    useEffect(() => {
        const updateApiKeyCount = () => {
            setApiKeyCount(getApiKeyCount());
        };

        // Initial count
        updateApiKeyCount();

        // Listen for API key updates
        const handleApiKeyUpdate = () => {
            updateApiKeyCount();
        };

        window.addEventListener('apiKeyUpdate', handleApiKeyUpdate);
        window.addEventListener('storage', handleApiKeyUpdate);

        return () => {
            window.removeEventListener('apiKeyUpdate', handleApiKeyUpdate);
            window.removeEventListener('storage', handleApiKeyUpdate);
        };
    }, []);

    const handleNavigation = (newPage) => {
        navigateTo(newPage);
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
              label={`${apiKeyCount} APIs Active`}
              size="small"
              color={apiKeyCount > 0 ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
                color="inherit" 
                onClick={() => handleNavigation('dashboard')} 
                disabled={!canNavigate}
                startIcon={<Dashboard />}
                variant={currentPage === 'dashboard' ? 'outlined' : 'text'}
            >
                Dashboard
            </Button>
            <Button 
                color="inherit" 
                onClick={() => handleNavigation('settings')}
                startIcon={<Settings />}
                variant={currentPage === 'settings' ? 'outlined' : 'text'}
            >
                Settings
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {currentPage === 'dashboard' && hasValidKey ? <DashboardPage /> : <SettingsPage />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
