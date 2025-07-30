import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { Api, CheckCircle, Error, Warning } from '@mui/icons-material';

const ApiStatusCard = ({ 
    title, 
    status = 'inactive', 
    lastUsed = null, 
    requestCount = 0,
    rateLimit = null 
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'active': return <CheckCircle color="success" />;
            case 'error': return <Error color="error" />;
            case 'warning': return <Warning color="warning" />;
            default: return <Api color="disabled" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'active': return 'success';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'active': return 'Active';
            case 'error': return 'Error';
            case 'warning': return 'Limited';
            default: return 'Inactive';
        }
    };

    return (
        <Card sx={{ minWidth: 200, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" component="h3">
                        {title}
                    </Typography>
                    {getStatusIcon()}
                </Box>
                
                <Chip 
                    label={getStatusText()} 
                    color={getStatusColor()} 
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                />
                
                {requestCount > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        {requestCount} requests today
                    </Typography>
                )}
                
                {lastUsed && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        Last used: {lastUsed}
                    </Typography>
                )}
                
                {rateLimit && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Rate limit: {rateLimit.used}/{rateLimit.total}
                        </Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={(rateLimit.used / rateLimit.total) * 100}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ApiStatusCard;