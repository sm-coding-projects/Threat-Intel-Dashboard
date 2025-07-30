import { createTheme } from '@mui/material/styles';
import { blueGrey, grey, blue, green, orange, red } from '@mui/material/colors';

// Custom color palette
const customColors = {
    primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#424242',
        light: '#6d6d6d',
        dark: '#1b1b1b',
        contrastText: '#ffffff',
    },
    success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
    },
    warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
    },
    error: {
        main: '#d32f2f',
        light: '#f44336',
        dark: '#c62828',
    },
    info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
    },
};

// Base theme configuration
const baseTheme = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01562em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.2,
            letterSpacing: '-0.00833em',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.2,
            letterSpacing: '0em',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.2,
            letterSpacing: '0.00735em',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.2,
            letterSpacing: '0em',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.2,
            letterSpacing: '0.0075em',
        },
        subtitle1: {
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.00938em',
        },
        subtitle2: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: '0.00714em',
        },
        body1: {
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.00938em',
        },
        body2: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: '0.01071em',
        },
        button: {
            fontWeight: 600,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: '0.02857em',
            textTransform: 'none',
        },
        caption: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.5,
            letterSpacing: '0.03333em',
        },
        overline: {
            fontWeight: 600,
            fontSize: '0.75rem',
            lineHeight: 1.5,
            letterSpacing: '0.08333em',
            textTransform: 'uppercase',
        },
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 8,
};

// Dark theme
export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        ...customColors,
        background: {
            default: '#0a0a0a',
            paper: '#1a1a1a',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0bec5',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: '#424242 #1a1a1a',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: '#1a1a1a',
                        width: 8,
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: '#424242',
                        minHeight: 24,
                        border: '2px solid #1a1a1a',
                    },
                    '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
                        backgroundColor: '#6d6d6d',
                    },
                    '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
                        backgroundColor: '#6d6d6d',
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#6d6d6d',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: `1px solid ${grey[800]}`,
                    backgroundImage: 'none',
                    transition: 'box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        borderColor: grey[700],
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    },
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        transition: 'border-color 0.2s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: grey[600],
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: grey[900],
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.01071em',
                        textTransform: 'uppercase',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${grey[800]}`,
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    '& .MuiTab-root': {
                        minHeight: 64,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        '&.Mui-selected': {
                            fontWeight: 600,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    fontSize: '0.75rem',
                },
                outlined: {
                    borderWidth: 1.5,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '& .MuiAlert-icon': {
                        fontSize: '1.25rem',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1a1a1a',
                    borderBottom: `1px solid ${grey[800]}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: '64px !important',
                },
            },
        },
    },
});

// Light theme (for future use)
export const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        ...customColors,
        background: {
            default: '#fafafa',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    border: `1px solid ${grey[200]}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        borderColor: grey[300],
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        transition: 'border-color 0.2s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: grey[400],
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: grey[50],
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.01071em',
                        textTransform: 'uppercase',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: grey[50],
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${grey[200]}`,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    borderBottom: `1px solid ${grey[200]}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

export default darkTheme;