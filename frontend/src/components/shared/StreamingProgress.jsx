import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Chip } from '@mui/material';

const StreamingProgress = ({ streamingIps }) => {
    if (streamingIps.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Processing IPs...</Typography>
            <List dense>
                {streamingIps.map((ip, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={ip.ip_address} />
                        {ip.status === 'processing' && <CircularProgress size={20} />}
                        {ip.status === 'enriched' && <Chip label="Enriched" color="success" size="small" />}
                        {ip.status === 'error' && <Chip label={ip.message} color="error" size="small" />}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default StreamingProgress;