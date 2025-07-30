import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const LoadingButton = ({ 
    loading, 
    children, 
    startIcon, 
    loadingText = 'Loading...', 
    ...props 
}) => {
    return (
        <Button
            {...props}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
            disabled={loading || props.disabled}
        >
            {loading ? loadingText : children}
        </Button>
    );
};

export default LoadingButton;