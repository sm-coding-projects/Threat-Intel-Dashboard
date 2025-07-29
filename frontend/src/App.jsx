import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ApiKeyPage from './components/ApiKeyPage';
import DashboardPage from './components/DashboardPage';
import { 
    CssBaseline, Container, Typography, createTheme, 
    ThemeProvider, Box, AppBar, Toolbar 
} from '@mui/material';
import { blueGrey, grey } from '@mui/material/colors';

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

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('apiKey');
    return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Threat Intel Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Router>
            <Routes>
                <Route path="/" element={<ApiKeyPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            </Routes>
        </Router>
      </Container>
    </ThemeProvider>
  );
}

export default App;
