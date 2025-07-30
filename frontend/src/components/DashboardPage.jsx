import React, { useState, useEffect } from 'react';
import { getIPs, addIPsFromFile, addIPsFromText, deleteIP } from '../api';
import { 
    TextField, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, CircularProgress, 
    Alert, Grid, Typography, Card, CardContent, Box,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tooltip, IconButton, Divider, Stack
} from '@mui/material';
import { CloudUpload, Send, Error, Visibility, InfoOutlined, Delete, TrendingUp } from '@mui/icons-material';
import LoadingButton from './shared/LoadingButton';

const DashboardPage = () => {
    const [ips, setIps] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedIp, setSelectedIp] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchIps = async () => {
        try {
            const response = await getIPs();
            setIps(response.data);
        } catch (error) {
            console.error("Error fetching IPs:", error);
            setError('Failed to fetch IPs. Please try again later.');
        }
    };

    useEffect(() => {
        fetchIps();
    }, []);

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;
        setLoading(true);
        setError('');
        try {
            const response = await addIPsFromText(textInput);
            setTextInput('');
            fetchIps();
            if (response.data.errors && response.data.errors.length > 0) {
                setError(`Completed with some errors: ${response.data.errors.join(', ')}`);
            }
        } catch (err) {
            console.error("Error submitting text IPs:", err);
            const errorMessage = err.response?.data?.error || 'An unknown error occurred.';
            setError(`Failed to submit IPs: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    const handleFileSubmit = async () => {
        if (!fileInput) return;
        setLoading(true);
        setError('');
        try {
            const response = await addIPsFromFile(fileInput);
            setFileInput(null);
            document.getElementById('file-input').value = null;
            fetchIps();
            if (response.data.errors && response.data.errors.length > 0) {
                setError(`Completed with some errors: ${response.data.errors.join(', ')}`);
            }
        } catch (err) {
            console.error("Error submitting file:", err);
            const errorMessage = err.response?.data?.error || 'An unknown error occurred.';
            setError(`Failed to submit IPs from file: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (ip) => {
        setSelectedIp(ip);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIp(null);
    };

    const handleDelete = async (ipId) => {
        const originalIps = [...ips];
        const updatedIps = ips.filter(ip => ip.id !== ipId);
        setIps(updatedIps);

        try {
            await deleteIP(ipId);
        } catch (error) {
            console.error("Error deleting IP:", error);
            setError('Failed to delete IP. Please try again later.');
            setIps(originalIps); // Revert optimistic update
        }
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                            IP Intelligence Dashboard
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Enrich IP addresses with threat intelligence data from multiple sources
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Add IPs from Text</Typography>
                            <TextField
                                label="Enter one IP per line"
                                multiline
                                rows={4}
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                            <LoadingButton
                                variant="contained" 
                                color="primary"
                                onClick={handleTextSubmit} 
                                disabled={!textInput.trim()} 
                                loading={loading}
                                loadingText="Processing..."
                                sx={{ mt: 2 }}
                                startIcon={<Send />}
                            >
                                Submit IPs
                            </LoadingButton>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ flexGrow: 1, mb: 0 }}>
                                    Add IPs from File
                                </Typography>
                                <Tooltip title={
                                    <React.Fragment>
                                        The file should contain one IP address per line.
                                        <br />
                                        For example:
                                        <br />
                                        8.8.8.8
                                        <br />
                                        1.1.1.1
                                    </React.Fragment>
                                }>
                                    <IconButton size="small">
                                        <InfoOutlined />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mb: 2, p: 1.5 }}
                                startIcon={<CloudUpload />}
                            >
                                {fileInput ? fileInput.name : "Choose File"}
                                <input type="file" id="file-input" hidden onChange={handleFileChange} />
                            </Button>
                            <LoadingButton
                                variant="contained" 
                                color="primary"
                                onClick={handleFileSubmit} 
                                disabled={!fileInput} 
                                loading={loading}
                                loadingText="Processing..."
                                fullWidth
                                startIcon={<CloudUpload />}
                            >
                                Upload & Process
                            </LoadingButton>
                        </CardContent>
                    </Card>
                </Grid>
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" icon={<Error />}>{error}</Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Enriched IP Addresses</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>IP Address</TableCell>
                                            <TableCell>Hostname</TableCell>
                                            <TableCell>Country</TableCell>
                                            <TableCell>Organization</TableCell>
                                            <TableCell>ASN</TableCell>
                                            <TableCell>Open Ports</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ips.length > 0 ? ips.map(ip => (
                                            <TableRow key={ip.id} hover>
                                                <TableCell>{ip.ip_address}</TableCell>
                                                <TableCell>{ip.hostname}</TableCell>
                                                <TableCell>{ip.country}</TableCell>
                                                <TableCell>{ip.org}</TableCell>
                                                <TableCell>{ip.asn}</TableCell>
                                                <TableCell>{ip.ports.join(', ')}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small"
                                                            onClick={() => handleViewDetails(ip)}
                                                            startIcon={<Visibility />}
                                                        >
                                                            Details
                                                        </Button>
                                                        <IconButton 
                                                            aria-label="delete"
                                                            size="small"
                                                            onClick={() => handleDelete(ip.id)}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography sx={{ p: 4, color: 'text.secondary' }}>
                                                        No IP data available. Add IPs to see results.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {selectedIp && (
                <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle>Raw JSON for {selectedIp.ip_address}</DialogTitle>
                    <DialogContent>
                        <Paper component="pre" sx={{ p: 2, whiteSpace: 'pre-wrap', backgroundColor: 'background.default' }}>
                            {JSON.stringify(selectedIp, null, 2)}
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default DashboardPage;
