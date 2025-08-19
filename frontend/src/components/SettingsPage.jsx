import React, { useState, useEffect } from 'react';
import { validateApiKey, getApiInfo } from '../api';
import {
    TextField, Button, CircularProgress,
    Alert, Grid, Typography, Card, CardContent, Box,
    Tabs, Tab, Divider, Chip, Stack, Paper
} from '@mui/material';
import {
    VpnKey, Delete, CheckCircle, Error, Api,
    Security, Storage, Notifications, Info, ArrowForward, Autorenew
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
    placeholder = "Enter API Key",
    status = "inactive",
    apiInfo,
    // Validation state props
    isValidating,
    validationStage,
    validationMessage,
    validationError
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

    const getButtonText = () => {
        switch (validationStage) {
            case 'validating': return 'Validating...';
            case 'success': return 'Validated!';
            case 'redirecting': return 'Redirecting...';
            default: return 'Validate & Save';
        }
    };

    const getButtonIcon = () => {
        switch (validationStage) {
            case 'validating': return <CircularProgress size={20} color="inherit" />;
            case 'success': return <CheckCircle />;
            case 'redirecting': return <Autorenew />;
            default: return <VpnKey />;
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
                    disabled={isValidating}
                />
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onValidate}
                        disabled={isValidating || !apiKey.trim()}
                        sx={{ flex: 1 }}
                        startIcon={getButtonIcon()}
                    >
                        {getButtonText()}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onDelete}
                        disabled={!apiKey || isValidating}
                        startIcon={<Delete />}
                    >
                        Delete
                    </Button>
                </Stack>
                {apiInfo && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">Plan: {apiInfo.plan}</Typography>
                        <Typography variant="body2">Query Credits: {apiInfo.query_credits}</Typography>
                        <Typography variant="body2">Scan Credits: {apiInfo.scan_credits}</Typography>
                    </Box>
                )}
                {/* Display dynamic feedback based on validation state */}
                {validationStage === 'success' && <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>{validationMessage}</Alert>}
                {validationStage === 'redirecting' && <Alert severity="info" icon={<ArrowForward />} sx={{ mt: 2 }}>{validationMessage}</Alert>}
                {validationStage === 'error' && <Alert severity="error" icon={<Error />} sx={{ mt: 2 }}>{validationError}</Alert>}
            </CardContent>
        </Card>
    );
};

const SettingsPage = () => {
    const [tabValue, setTabValue] = useState(0);
    
    // Use the validation hook for enhanced state management
    const {
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

    const isValidating = validationStage === 'validating' || validationStage === 'redirecting';

    // API key input states
    const [shodanApiKey, setShodanApiKey] = useState(localStorage.getItem('shodanApiKey') || '');
    const [virusTotalApiKey, setVirusTotalApiKey] = useState(localStorage.getItem('virusTotalApiKey') || '');
    const [abuseIPDBApiKey, setAbuseIPDBApiKey] = useState(localStorage.getItem('abuseIPDBApiKey') || '');
    const [apiInfo, setApiInfo] = useState(null);

    // Effect to handle navigation timing
    useEffect(() => {
        if (validationStage === 'success') {
            const timer = setTimeout(() => {
                startRedirect(validatingProvider);
            }, 1500);
            return () => clearTimeout(timer);
        }

        if (validationStage === 'redirecting') {
            const timer = setTimeout(() => {
                triggerNavigationToDashboard();
                resetValidation();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [validationStage, validatingProvider, startRedirect, resetValidation]);

    useEffect(() => {
        const fetchApiInfo = async () => {
            try {
                const response = await getApiInfo();
                setApiInfo(response.data);
            } catch (error) {
                console.error("Error fetching API info:", error);
            }
        };

        if (localStorage.getItem('shodanApiKey')) {
            fetchApiInfo();
        }
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Generic API key change handler
    const handleApiKeyChange = (setter) => (e) => {
        setter(e.target.value);
        if (validationStage !== 'idle') {
            resetValidation();
        }
    };

    // Generic API key delete handler
    const handleApiKeyDelete = (provider, setter) => () => {
        removeApiKeyForProvider(provider);
        setter('');
        resetValidation();
        triggerApiKeyUpdate(provider, 'removed');
    };

    // Shodan API handlers
    const handleShodanApiKeyValidate = async () => {
        if (!shodanApiKey.trim()) {
            markValidationError('shodan', 'Shodan API key is required.');
            return;
        }
        
        startValidation('shodan');
        
        try {
            const response = await validateApiKey(shodanApiKey);
            if (response.data.is_valid) {
                setApiKeyForProvider('shodan', shodanApiKey);
                markValidationSuccess('shodan', 'Shodan API key validated successfully!');
                triggerApiKeyUpdate('shodan', 'validated');
            } else {
                removeApiKeyForProvider('shodan');
                markValidationError('shodan', 'Invalid Shodan API key.');
            }
        } catch (error) {
            console.error("Error validating Shodan API key:", error);
            const errorMsg = error.response?.data?.error || 'Failed to validate Shodan API key. Please try again later.';
            markValidationError('shodan', errorMsg);
        }
    };

    // Placeholder handlers for other APIs
    const handleVirusTotalApiKeyValidate = async () => {
        if (!virusTotalApiKey.trim()) {
            markValidationError('virustotal', 'VirusTotal API key is required.');
            return;
        }
        
        startValidation('virustotal');
        
        // Placeholder - implement actual validation when VirusTotal integration is added
        setTimeout(() => {
            setApiKeyForProvider('virustotal', virusTotalApiKey);
            markValidationSuccess('virustotal', 'VirusTotal API key saved successfully! (Integration coming soon)');
            triggerApiKeyUpdate('virustotal', 'validated');
        }, 1000);
    };

    const handleAbuseIPDBApiKeyValidate = async () => {
        if (!abuseIPDBApiKey.trim()) {
            markValidationError('abuseipdb', 'AbuseIPDB API key is required.');
            return;
        }
        
        startValidation('abuseipdb');
        
        // Placeholder - implement actual validation when AbuseIPDB integration is added
        setTimeout(() => {
            setApiKeyForProvider('abuseipdb', abuseIPDBApiKey);
            markValidationSuccess('abuseipdb', 'AbuseIPDB API key saved successfully! (Integration coming soon)');
            triggerApiKeyUpdate('abuseipdb', 'validated');
        }, 1000);
    };

    const getProviderStatus = (provider, apiKey) => {
        if (validatingProvider === provider) {
            if (validationStage === 'validating' || validationStage === 'redirecting') return 'testing';
            if (validationStage === 'error') return 'invalid';
        }
        if (apiKey && localStorage.getItem(`${provider}ApiKey`)) return 'active';
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
                            onApiKeyChange={handleApiKeyChange(setShodanApiKey)}
                            onValidate={handleShodanApiKeyValidate}
                            onDelete={handleApiKeyDelete('shodan', setShodanApiKey)}
                            placeholder="Enter Shodan API Key"
                            status={getProviderStatus('shodan', shodanApiKey)}
                            apiInfo={apiInfo}
                            isValidating={isValidating && validatingProvider === 'shodan'}
                            validationStage={validatingProvider === 'shodan' ? validationStage : 'idle'}
                            validationMessage={validatingProvider === 'shodan' ? validationMessage : ''}
                            validationError={validatingProvider === 'shodan' ? validationError : null}
                        />

                        <ApiKeyCard
                            title="VirusTotal API"
                            description="VirusTotal analyzes files and URLs for malicious content. Perfect for file hash and URL reputation checks. (Coming Soon)"
                            apiKey={virusTotalApiKey}
                            onApiKeyChange={handleApiKeyChange(setVirusTotalApiKey)}
                            onValidate={handleVirusTotalApiKeyValidate}
                            onDelete={handleApiKeyDelete('virustotal', setVirusTotalApiKey)}
                            placeholder="Enter VirusTotal API Key"
                            status={getProviderStatus('virustotal', virusTotalApiKey)}
                            isValidating={isValidating && validatingProvider === 'virustotal'}
                            validationStage={validatingProvider === 'virustotal' ? validationStage : 'idle'}
                            validationMessage={validatingProvider === 'virustotal' ? validationMessage : ''}
                            validationError={validatingProvider === 'virustotal' ? validationError : null}
                        />

                        <ApiKeyCard
                            title="AbuseIPDB API"
                            description="AbuseIPDB provides IP reputation data and abuse reports. Ideal for checking if an IP has been reported for malicious activity. (Coming Soon)"
                            apiKey={abuseIPDBApiKey}
                            onApiKeyChange={handleApiKeyChange(setAbuseIPDBApiKey)}
                            onValidate={handleAbuseIPDBApiKeyValidate}
                            onDelete={handleApiKeyDelete('abuseipdb', setAbuseIPDBApiKey)}
                            placeholder="Enter AbuseIPDB API Key"
                            status={getProviderStatus('abuseipdb', abuseIPDBApiKey)}
                            isValidating={isValidating && validatingProvider === 'abuseipdb'}
                            validationStage={validatingProvider === 'abuseipdb' ? validationStage : 'idle'}
                            validationMessage={validatingProvider === 'abuseipdb' ? validationMessage : ''}
                            validationError={validatingProvider === 'abuseipdb' ? validationError : null}
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
