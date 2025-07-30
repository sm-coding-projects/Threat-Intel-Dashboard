import React, { useState } from 'react';
import { validateApiKey } from '../api';
import {
    TextField, Button, CircularProgress,
    Alert, Grid, Typography, Card, CardContent, Box,
    Tabs, Tab, Divider, Chip, Stack, Paper
} from '@mui/material';
import {
    VpnKey, Delete, CheckCircle, Error, Api,
    Security, Storage, Notifications, Info, ArrowForward
} from '@mui/icons-material';
import { useApiKeyValidation } from '../hooks/useApiKeyState';
import { 
    setApiKeyForProvider, 
    removeApiKeyForProvider, 
    triggerApiKeyUpdate, 
    triggerNavigationToDashboard 
} from '../utils/apiKeyUtils';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// API Key Card Component
const ApiKeyCard = ({
    title,
    description,
    apiKey,
    onApiKeyChange,
    onValidate,
    onDelete,
    loading,
    error,
    success,
    placeholder = "Enter API Key",
    status = "inactive"
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'active': return 'success';
            case 'invalid': return 'error';
            case 'testing': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'active': return 'Active';
            case 'invalid': return 'Invalid';
            case 'testing': return 'Testing';
            default: return 'Not Configured';
        }
    };

    return (
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                        {title}
                    </Typography>
                    <Chip
                        label={getStatusText()}
                        color={getStatusColor()}
                        size="small"
                        variant="outlined"
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {description}
                </Typography>
                <TextField
                    label={placeholder}
                    value={apiKey}
                    onChange={onApiKeyChange}
                    fullWidth
                    type="password"
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onValidate}
                        disabled={loading || !apiKey.trim()}
                        sx={{ flex: 1 }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKey />}
                    >
                        {loading ? 'Validating...' : 'Validate & Save'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onDelete}
                        disabled={!apiKey}
                        startIcon={<Delete />}
                    >
                        Delete
                    </Button>
                </Stack>
                {error && <Alert severity="error" icon={<Error />} sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>{success}</Alert>}
            </CardContent>
        </Card>
    );
};

const SettingsPage = () => {
    const [tabValue, setTabValue] = useState(0);
    
    // Use the validation hook for enhanced state management
    const {
        isValidating,
        provider: validatingProvider,
        stage: validationStage,
        message: validationMessage,
        error: validationError,
        startValidation,
        markValidationSuccess,
        markValidationError,
        startRedirect,
        resetValidation
    } = useApiKeyValidation();

    // API key input states
    const [shodanApiKey, setShodanApiKey] = useState(localStorage.getItem('shodanApiKey') || '');
    const [virusTotalApiKey, setVirusTotalApiKey] = useState(localStorage.getItem('virusTotalApiKey') || '');
    const [abuseIPDBApiKey, setAbuseIPDBApiKey] = useState(localStorage.getItem('abuseIPDBApiKey') || '');

    // Individual success/error states for display
    const [shodanSuccess, setShodanSuccess] = useState('');
    const [shodanError, setShodanError] = useState('');
    const [virusTotalSuccess, setVirusTotalSuccess] = useState('');
    const [virusTotalError, setVirusTotalError] = useState('');
    const [abuseIPDBSuccess, setAbuseIPDBSuccess] = useState('');
    const [abuseIPDBError, setAbuseIPDBError] = useState('');

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Shodan API handlers
    const handleShodanApiKeyChange = (e) => {
        setShodanApiKey(e.target.value);
        setShodanError('');
        setShodanSuccess('');
    };

    const handleShodanApiKeyValidate = async () => {
        if (!shodanApiKey.trim()) {
            setShodanError('Shodan API key is required.');
            return;
        }
        
        // Clear previous states
        setShodanError('');
        setShodanSuccess('');
        
        // Start validation process
        startValidation('shodan');
        
        try {
            const response = await validateApiKey(shodanApiKey);
            if (response.data.is_valid) {
                // Save API key using utility function
                setApiKeyForProvider('shodan', shodanApiKey);
                
                // Mark validation as successful
                markValidationSuccess('shodan', 'Shodan API key validated successfully!');
                setShodanSuccess('Shodan API key validated successfully!');
                
                // Trigger API key update event
                triggerApiKeyUpdate('shodan', 'validated');
                
                // Start redirect process after a brief delay
                setTimeout(() => {
                    startRedirect('shodan', 'Redirecting to Dashboard...');
                    setShodanSuccess('Redirecting to Dashboard...');
                    
                    // Navigate to dashboard after another brief delay
                    setTimeout(() => {
                        triggerNavigationToDashboard();
                        resetValidation();
                    }, 1500);
                }, 1500);
                
            } else {
                // Remove invalid key
                removeApiKeyForProvider('shodan');
                const errorMsg = 'Invalid Shodan API key.';
                markValidationError('shodan', errorMsg);
                setShodanError(errorMsg);
            }
        } catch (error) {
            console.error("Error validating Shodan API key:", error);
            const errorMsg = 'Failed to validate Shodan API key. Please try again later.';
            markValidationError('shodan', errorMsg);
            setShodanError(errorMsg);
        }
    };

    const handleShodanApiKeyDelete = () => {
        removeApiKeyForProvider('shodan');
        setShodanApiKey('');
        setShodanSuccess('Shodan API key has been deleted.');
        setShodanError('');
        
        // Trigger update event
        triggerApiKeyUpdate('shodan', 'removed');
    };

    // Placeholder handlers for other APIs
    const handleVirusTotalApiKeyChange = (e) => {
        setVirusTotalApiKey(e.target.value);
        setVirusTotalError('');
        setVirusTotalSuccess('');
    };

    const handleVirusTotalApiKeyValidate = async () => {
        if (!virusTotalApiKey.trim()) {
            setVirusTotalError('VirusTotal API key is required.');
            return;
        }
        
        // Clear previous states
        setVirusTotalError('');
        setVirusTotalSuccess('');
        
        // Start validation process
        startValidation('virustotal');
        
        // Placeholder - implement actual validation when VirusTotal integration is added
        setTimeout(() => {
            // Save API key
            setApiKeyForProvider('virustotal', virusTotalApiKey);
            
            // Mark as successful
            markValidationSuccess('virustotal', 'VirusTotal API key saved successfully!');
            setVirusTotalSuccess('VirusTotal API key saved successfully! (Integration coming soon)');
            
            // Trigger update event
            triggerApiKeyUpdate('virustotal', 'validated');
            
            // Start redirect process
            setTimeout(() => {
                startRedirect('virustotal', 'Redirecting to Dashboard...');
                setVirusTotalSuccess('Redirecting to Dashboard...');
                
                // Navigate to dashboard
                setTimeout(() => {
                    triggerNavigationToDashboard();
                    resetValidation();
                }, 1500);
            }, 1500);
        }, 1000);
    };

    const handleVirusTotalApiKeyDelete = () => {
        removeApiKeyForProvider('virustotal');
        setVirusTotalApiKey('');
        setVirusTotalSuccess('VirusTotal API key has been deleted.');
        setVirusTotalError('');
        
        // Trigger update event
        triggerApiKeyUpdate('virustotal', 'removed');
    };

    const handleAbuseIPDBApiKeyChange = (e) => {
        setAbuseIPDBApiKey(e.target.value);
        setAbuseIPDBError('');
        setAbuseIPDBSuccess('');
    };

    const handleAbuseIPDBApiKeyValidate = async () => {
        if (!abuseIPDBApiKey.trim()) {
            setAbuseIPDBError('AbuseIPDB API key is required.');
            return;
        }
        
        // Clear previous states
        setAbuseIPDBError('');
        setAbuseIPDBSuccess('');
        
        // Start validation process
        startValidation('abuseipdb');
        
        // Placeholder - implement actual validation when AbuseIPDB integration is added
        setTimeout(() => {
            // Save API key
            setApiKeyForProvider('abuseipdb', abuseIPDBApiKey);
            
            // Mark as successful
            markValidationSuccess('abuseipdb', 'AbuseIPDB API key saved successfully!');
            setAbuseIPDBSuccess('AbuseIPDB API key saved successfully! (Integration coming soon)');
            
            // Trigger update event
            triggerApiKeyUpdate('abuseipdb', 'validated');
            
            // Start redirect process
            setTimeout(() => {
                startRedirect('abuseipdb', 'Redirecting to Dashboard...');
                setAbuseIPDBSuccess('Redirecting to Dashboard...');
                
                // Navigate to dashboard
                setTimeout(() => {
                    triggerNavigationToDashboard();
                    resetValidation();
                }, 1500);
            }, 1500);
        }, 1000);
    };

    const handleAbuseIPDBApiKeyDelete = () => {
        removeApiKeyForProvider('abuseipdb');
        setAbuseIPDBApiKey('');
        setAbuseIPDBSuccess('AbuseIPDB API key has been deleted.');
        setAbuseIPDBError('');
        
        // Trigger update event
        triggerApiKeyUpdate('abuseipdb', 'removed');
    };

    const getShodanStatus = () => {
        if (isValidating && validatingProvider === 'shodan') return 'testing';
        if (shodanApiKey && localStorage.getItem('shodanApiKey')) return 'active';
        if (shodanError) return 'invalid';
        return 'inactive';
    };

    const getVirusTotalStatus = () => {
        if (isValidating && validatingProvider === 'virustotal') return 'testing';
        if (virusTotalApiKey && localStorage.getItem('virusTotalApiKey')) return 'active';
        if (virusTotalError) return 'invalid';
        return 'inactive';
    };

    const getAbuseIPDBStatus = () => {
        if (isValidating && validatingProvider === 'abuseipdb') return 'testing';
        if (abuseIPDBApiKey && localStorage.getItem('abuseIPDBApiKey')) return 'active';
        if (abuseIPDBError) return 'invalid';
        return 'inactive';
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Settings
            </Typography>

            <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="settings tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab
                        icon={<Api />}
                        label="API Integrations"
                        id="settings-tab-0"
                        aria-controls="settings-tabpanel-0"
                        sx={{ minHeight: 64 }}
                    />
                    <Tab
                        icon={<Security />}
                        label="Security"
                        id="settings-tab-1"
                        aria-controls="settings-tabpanel-1"
                        sx={{ minHeight: 64 }}
                        disabled
                    />
                    <Tab
                        icon={<Storage />}
                        label="Data Management"
                        id="settings-tab-2"
                        aria-controls="settings-tabpanel-2"
                        sx={{ minHeight: 64 }}
                        disabled
                    />
                    <Tab
                        icon={<Notifications />}
                        label="Notifications"
                        id="settings-tab-3"
                        aria-controls="settings-tabpanel-3"
                        sx={{ minHeight: 64 }}
                        disabled
                    />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Info sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="body2" color="text.secondary">
                                Configure API keys for various threat intelligence services. Each service provides different types of data enrichment.
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <ApiKeyCard
                            title="Shodan API"
                            description="Shodan is a search engine for Internet-connected devices. Use it to gather information about IP addresses, open ports, and services."
                            apiKey={shodanApiKey}
                            onApiKeyChange={handleShodanApiKeyChange}
                            onValidate={handleShodanApiKeyValidate}
                            onDelete={handleShodanApiKeyDelete}
                            loading={isValidating && validatingProvider === 'shodan'}
                            error={shodanError}
                            success={shodanSuccess}
                            placeholder="Enter Shodan API Key"
                            status={getShodanStatus()}
                        />

                        <ApiKeyCard
                            title="VirusTotal API"
                            description="VirusTotal analyzes files and URLs for malicious content. Perfect for file hash and URL reputation checks. (Coming Soon)"
                            apiKey={virusTotalApiKey}
                            onApiKeyChange={handleVirusTotalApiKeyChange}
                            onValidate={handleVirusTotalApiKeyValidate}
                            onDelete={handleVirusTotalApiKeyDelete}
                            loading={isValidating && validatingProvider === 'virustotal'}
                            error={virusTotalError}
                            success={virusTotalSuccess}
                            placeholder="Enter VirusTotal API Key"
                            status={getVirusTotalStatus()}
                        />

                        <ApiKeyCard
                            title="AbuseIPDB API"
                            description="AbuseIPDB provides IP reputation data and abuse reports. Ideal for checking if an IP has been reported for malicious activity. (Coming Soon)"
                            apiKey={abuseIPDBApiKey}
                            onApiKeyChange={handleAbuseIPDBApiKeyChange}
                            onValidate={handleAbuseIPDBApiKeyValidate}
                            onDelete={handleAbuseIPDBApiKeyDelete}
                            loading={isValidating && validatingProvider === 'abuseipdb'}
                            error={abuseIPDBError}
                            success={abuseIPDBSuccess}
                            placeholder="Enter AbuseIPDB API Key"
                            status={getAbuseIPDBStatus()}
                        />
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Security Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coming soon - Configure security preferences, session timeouts, and access controls.
                        </Typography>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Storage sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Data Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coming soon - Manage data retention, export options, and storage preferences.
                        </Typography>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Notifications
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coming soon - Configure alerts, email notifications, and reporting preferences.
                        </Typography>
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
