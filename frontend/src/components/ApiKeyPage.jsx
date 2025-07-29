import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateApiKey } from '../api';
import { 
    TextField, Button, CircularProgress, 
    Alert, Grid, Typography, Card, CardContent, Box
} from '@mui/material';
import { VpnKey, CheckCircle, Error } from '@mui/icons-material';

const ApiKeyPage = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleApiKeyChange = (e) => {
        setApiKey(e.target.value);
    };

    const handleApiKeyValidate = async () => {
        if (!apiKey) {
            setError('API key is required.');
            return;
        }
        setLoading(true);
        try {
            const response = await validateApiKey(apiKey);
            if (response.data.is_valid) {
                localStorage.setItem('apiKey', apiKey);
                setError('');
                navigate('/dashboard');
            } else {
                localStorage.removeItem('apiKey');
                setError('Invalid API key.');
            }
        } catch (error) {
            console.error("Error validating API key:", error);
            setError('Failed to validate API key. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 64px)' }}>
            <Grid item xs={12} sm={8} md={6} lg={4}>
                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" component="h1" gutterBottom align="center">
                            Shodan API Key
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                            Please enter your Shodan API key to continue.
                        </Typography>
                        <TextField
                            label="Shodan API Key"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            fullWidth
                            type="password"
                            variant="outlined"
                        />
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleApiKeyValidate} 
                            disabled={loading} 
                            fullWidth
                            sx={{ mt: 3, py: 1.5 }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKey />}
                        >
                            Validate & Save Key
                        </Button>
                        {error && <Alert severity="error" icon={<Error />} sx={{ mt: 2 }}>{error}</Alert>}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ApiKeyPage;
