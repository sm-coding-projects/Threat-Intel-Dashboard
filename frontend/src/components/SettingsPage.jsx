import React, { useState } from 'react';
import { validateApiKey } from '../api';
import { 
    TextField, Button, CircularProgress, 
    Alert, Grid, Typography, Card, CardContent, Box
} from '@mui/material';
import { VpnKey, Delete, CheckCircle, Error } from '@mui/icons-material';

const SettingsPage = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleApiKeyChange = (e) => {
        setApiKey(e.target.value);
    };

    const handleApiKeyValidate = async () => {
        if (!apiKey) {
            setError('API key is required.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await validateApiKey(apiKey);
            if (response.data.is_valid) {
                localStorage.setItem('apiKey', apiKey);
                setSuccess('API key is valid and has been saved.');
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

    const handleApiKeyDelete = () => {
        localStorage.removeItem('apiKey');
        setApiKey('');
        setSuccess('API key has been deleted.');
        setError('');
    };

    return (
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 64px)' }}>
            <Grid item xs={12} sm={8} md={6} lg={4}>
                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" component="h1" gutterBottom align="center">
                            API Key Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                            Manage your Shodan API key.
                        </Typography>
                        <TextField
                            label="Shodan API Key"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            fullWidth
                            type="password"
                            variant="outlined"
                        />
                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={handleApiKeyValidate} 
                                disabled={loading} 
                                fullWidth
                                sx={{ py: 1.5 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKey />}
                            >
                                Validate & Save
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="error"
                                onClick={handleApiKeyDelete} 
                                fullWidth
                                sx={{ py: 1.5 }}
                                startIcon={<Delete />}
                            >
                                Delete Key
                            </Button>
                        </Box>
                        {error && <Alert severity="error" icon={<Error />} sx={{ mt: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>{success}</Alert>}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default SettingsPage;
