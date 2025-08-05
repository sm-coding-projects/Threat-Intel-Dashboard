import React, { useState, useEffect } from 'react';
import { getIPs, addIPsFromFile, addIPsFromText, deleteIP, deleteIPs } from '../api';
import { 
    TextField, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, CircularProgress, 
    Alert, Grid, Typography, Card, CardContent, Box,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Tooltip, IconButton, Divider, Stack, Chip, Checkbox
} from '@mui/material';
import { CloudUpload, Send, Error, Visibility, InfoOutlined, Delete, TrendingUp, CheckCircle, Warning, FileDownload } from '@mui/icons-material';
import LoadingButton from './shared/LoadingButton';
import ToastNotification from './shared/ToastNotification';
import StreamingProgress from './shared/StreamingProgress';

const DashboardPage = () => {
    const [ips, setIps] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
    const [selectedIp, setSelectedIp] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [streamingIps, setStreamingIps] = useState([]);
    const [filters, setFilters] = useState({
        ip_address: '',
        hostname: '',
        country: '',
        org: '',
        asn: '',
        ports: '',
        status: '',
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const filteredIps = ips.filter(ip => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key].toLowerCase();
            if (!filterValue) return true;

            if (key === 'ports') {
                return ip.ports.some(port => port.toString().toLowerCase().includes(filterValue));
            }
            
            if (ip[key]) {
                return ip[key].toString().toLowerCase().includes(filterValue);
            }

            return false;
        });
    });

    const fetchIps = async () => {
        try {
            const response = await getIPs();
            setIps(response.data.map(ip => ({ ...ip, status: 'Enriched' })));
        } catch (error) {
            console.error("Error fetching IPs:", error);
            setNotification({ open: true, message: 'Failed to fetch IPs. Please try again later.', severity: 'error' });
        }
    };

    useEffect(() => {
        fetchIps();
    }, []);

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;
        setLoading(true);
        setStreamingIps([]);
        try {
            const eventSource = await addIPsFromText(textInput);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.error) {
                    setNotification({ open: true, message: data.error, severity: 'error' });
                    eventSource.close();
                    setLoading(false);
                    return;
                }

                setStreamingIps(prevIps => [...prevIps, data]);

                if (data.status === 'enriched') {
                    fetchIps();
                }
            };

            eventSource.onerror = (err) => {
                console.error("EventSource failed:", err);
                setNotification({ open: true, message: 'An error occurred while streaming data.', severity: 'error' });
                eventSource.close();
                setLoading(false);
            };

            eventSource.onopen = () => {
                setLoading(false);
                setTextInput('');
            };
        } catch (error) {
            console.error("Error streaming IPs:", error);
            setNotification({ open: true, message: 'Error streaming IPs.', severity: 'error' });
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    const handleFileSubmit = async () => {
        if (!fileInput) return;
        setLoading(true);
        setStreamingIps([]);
        try {
            const eventSource = await addIPsFromFile(fileInput);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.error) {
                    setNotification({ open: true, message: data.error, severity: 'error' });
                    eventSource.close();
                    setLoading(false);
                    return;
                }

                setStreamingIps(prevIps => [...prevIps, data]);

                if (data.status === 'enriched') {
                    fetchIps();
                }
            };

            eventSource.onerror = (err) => {
                console.error("EventSource failed:", err);
                setNotification({ open: true, message: 'An error occurred while streaming data.', severity: 'error' });
                eventSource.close();
                setLoading(false);
            };

            eventSource.onopen = () => {
                setLoading(false);
                setFileInput(null);
                document.getElementById('file-input').value = null;
            };
        } catch (error) {
            console.error("Error reading file:", error);
            setNotification({ open: true, message: 'Error reading file.', severity: 'error' });
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
            setNotification({ open: true, message: 'IP address deleted successfully.', severity: 'success' });
        } catch (error) {
            console.error("Error deleting IP:", error);
            setNotification({ open: true, message: 'Failed to delete IP. Please try again later.', severity: 'error' });
            setIps(originalIps); // Revert optimistic update
        }
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = filteredIps.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handleDeleteSelected = async () => {
        const originalIps = [...ips];
        const updatedIps = ips.filter(ip => !selected.includes(ip.id));
        setIps(updatedIps);
        try {
            await deleteIPs(selected);
            setNotification({ open: true, message: 'Selected IP addresses deleted successfully.', severity: 'success' });
            setSelected([]);
        } catch (error) {
            console.error("Error deleting selected IPs:", error);
            setNotification({ open: true, message: 'Failed to delete selected IPs. Please try again later.', severity: 'error' });
            setIps(originalIps);
        }
    };

    const handleExport = () => {
        const headers = ["IP Address", "Hostname", "Country", "Organization", "ASN", "Open Ports", "Status"];
        const csvContent = [
            headers.join(","),
            ...ips.map(ip => [
                ip.ip_address,
                `"${ip.hostname}"`,
                ip.country,
                `"${ip.org}"`,
                ip.asn,
                `"${ip.ports.join(', ')}"`,
                ip.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = "ip_intelligence_export.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box>
            <ToastNotification 
                open={notification.open} 
                message={notification.message} 
                severity={notification.severity} 
                onClose={handleCloseNotification} 
            />
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
                            <StreamingProgress streamingIps={streamingIps} />
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
                            <StreamingProgress streamingIps={streamingIps} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Enriched IP Addresses</Typography>
                                <Box>
                                    <Button 
                                        variant="outlined"
                                        startIcon={<FileDownload />}
                                        onClick={handleExport}
                                        sx={{ mr: 1 }}
                                    >
                                        Export CSV
                                    </Button>
                                    <Button 
                                        variant="contained"
                                        color="error"
                                        startIcon={<Delete />}
                                        disabled={selected.length === 0}
                                        onClick={handleDeleteSelected}
                                    >
                                        Delete Selected
                                    </Button>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    indeterminate={selected.length > 0 && selected.length < filteredIps.length}
                                                    checked={filteredIps.length > 0 && selected.length === filteredIps.length}
                                                    onChange={handleSelectAllClick}
                                                    inputProps={{ 'aria-label': 'select all desserts' }}
                                                />
                                            </TableCell>
                                            <TableCell>IP Address</TableCell>
                                            <TableCell>Hostname</TableCell>
                                            <TableCell>Country</TableCell>
                                            <TableCell>Organization</TableCell>
                                            <TableCell>ASN</TableCell>
                                            <TableCell>Open Ports</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell><TextField name="ip_address" value={filters.ip_address} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell><TextField name="hostname" value={filters.hostname} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell><TextField name="country" value={filters.country} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell><TextField name="org" value={filters.org} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell><TextField name="asn" value={filters.asn} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell><TextField name="ports" value={filters.ports} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell><TextField name="status" value={filters.status} onChange={handleFilterChange} variant="standard" fullWidth /></TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredIps.length > 0 ? filteredIps.map((ip, index) => {
                                            const isItemSelected = isSelected(ip.id);
                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                <TableRow 
                                                    key={ip.id} 
                                                    hover
                                                    onClick={(event) => handleClick(event, ip.id)}
                                                    role="checkbox"
                                                    aria-checked={isItemSelected}
                                                    tabIndex={-1}
                                                    selected={isItemSelected}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isItemSelected}
                                                            inputProps={{ 'aria-labelledby': labelId }}
                                                        />
                                                    </TableCell>
                                                    <TableCell component="th" id={labelId} scope="row" padding="none">{ip.ip_address}</TableCell>
                                                    <TableCell>{ip.hostname}</TableCell>
                                                    <TableCell>{ip.country}</TableCell>
                                                    <TableCell>{ip.org}</TableCell>
                                                    <TableCell>{ip.asn}</TableCell>
                                                    <TableCell>{ip.ports.join(', ')}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            icon={ip.status === 'Enriched' ? <CheckCircle /> : <Warning />}
                                                            label={ip.status}
                                                            color={ip.status === 'Enriched' ? 'success' : 'warning'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button 
                                                                variant="outlined" 
                                                                size="small"
                                                                onClick={(e) => { e.stopPropagation(); handleViewDetails(ip); }}
                                                                startIcon={<Visibility />}
                                                            >
                                                                Details
                                                            </Button>
                                                            <IconButton 
                                                                aria-label="delete"
                                                                size="small"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(ip.id); }}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }) : (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center">
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
