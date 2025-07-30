/**
 * Custom hook for managing API key state with real-time updates
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  getActiveApiKeys, 
  hasValidApiKey, 
  getApiKeyCount, 
  initializeApiKeyState,
  cleanupApiKeys
} from '../utils/apiKeyUtils';

/**
 * Hook for managing API key state with real-time updates
 * @returns {Object} API key state and management functions
 */
export const useApiKeyState = () => {
  const [state, setState] = useState(() => initializeApiKeyState());
  const [isLoading, setIsLoading] = useState(false);

  // Update state based on current localStorage
  const refreshState = useCallback(() => {
    const newState = initializeApiKeyState();
    setState(newState);
    return newState;
  }, []);

  // Handle API key updates from custom events
  const handleApiKeyUpdate = useCallback((event) => {
    const { detail } = event;
    console.log('API Key Update Event:', detail);
    
    // Refresh state after any API key change
    const newState = refreshState();
    
    // Trigger additional actions based on the update
    if (detail.status === 'validated' && newState.hasValidKey) {
      // API key was successfully validated
      console.log('API key validated, navigation should be enabled');
    }
  }, [refreshState]);

  // Handle storage changes (cross-tab synchronization)
  const handleStorageChange = useCallback((event) => {
    // Only respond to API key related storage changes
    if (event.key && (
      event.key.includes('ApiKey') || 
      event.key === 'apiKey'
    )) {
      console.log('Storage change detected:', event.key);
      refreshState();
    }
  }, [refreshState]);

  // Set up event listeners
  useEffect(() => {
    // Clean up any invalid keys on mount
    cleanupApiKeys();
    
    // Initial state refresh
    refreshState();

    // Listen for custom API key update events
    window.addEventListener('apiKeyUpdate', handleApiKeyUpdate);
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('apiKeyUpdate', handleApiKeyUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleApiKeyUpdate, handleStorageChange, refreshState]);

  // Manual refresh function for components
  const refresh = useCallback(() => {
    setIsLoading(true);
    const newState = refreshState();
    setIsLoading(false);
    return newState;
  }, [refreshState]);

  return {
    // State
    apiKeys: state.apiKeys,
    count: state.count,
    hasValidKey: state.hasValidKey,
    navigationEnabled: state.navigationEnabled,
    primaryKey: state.primaryKey,
    isLoading,
    
    // Actions
    refresh,
    refreshState
  };
};

/**
 * Hook for managing navigation state based on API keys
 * @returns {Object} Navigation state and functions
 */
export const useNavigationState = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [canNavigate, setCanNavigate] = useState(false);
  const { hasValidKey, refresh } = useApiKeyState();

  // Update navigation state when API key state changes
  useEffect(() => {
    setCanNavigate(hasValidKey);
    
    // If no valid keys and user is on dashboard, redirect to settings
    if (!hasValidKey && currentPage === 'dashboard') {
      setCurrentPage('settings');
    }
  }, [hasValidKey, currentPage]);

  // Handle navigation requests
  const handleNavigationRequest = useCallback((event) => {
    const { detail } = event;
    console.log('Navigation request:', detail);
    
    if (canNavigate) {
      setCurrentPage('dashboard');
    } else {
      console.warn('Navigation blocked: No valid API key');
    }
  }, [canNavigate]);

  // Set up navigation event listener
  useEffect(() => {
    window.addEventListener('navigateToDashboard', handleNavigationRequest);
    
    return () => {
      window.removeEventListener('navigateToDashboard', handleNavigationRequest);
    };
  }, [handleNavigationRequest]);

  // Navigation functions
  const navigateTo = useCallback((page) => {
    if (page === 'dashboard' && !canNavigate) {
      console.warn('Cannot navigate to dashboard: No valid API key');
      return false;
    }
    
    setCurrentPage(page);
    return true;
  }, [canNavigate]);

  const navigateToDashboard = useCallback(() => {
    return navigateTo('dashboard');
  }, [navigateTo]);

  const navigateToSettings = useCallback(() => {
    return navigateTo('settings');
  }, [navigateTo]);

  return {
    // State
    currentPage,
    canNavigate,
    hasValidKey,
    
    // Actions
    navigateTo,
    navigateToDashboard,
    navigateToSettings,
    setCurrentPage,
    refresh
  };
};

/**
 * Hook for managing API key validation state
 * @returns {Object} Validation state and functions
 */
export const useApiKeyValidation = () => {
  const [validationState, setValidationState] = useState({
    isValidating: false,
    provider: null,
    stage: 'idle', // idle, validating, success, error, redirecting
    message: '',
    error: null
  });

  // Start validation
  const startValidation = useCallback((provider) => {
    setValidationState({
      isValidating: true,
      provider,
      stage: 'validating',
      message: 'Validating API key...',
      error: null
    });
  }, []);

  // Mark validation as successful
  const markValidationSuccess = useCallback((provider, message = 'API key validated successfully!') => {
    setValidationState({
      isValidating: false,
      provider,
      stage: 'success',
      message,
      error: null
    });
  }, []);

  // Mark validation as failed
  const markValidationError = useCallback((provider, error) => {
    setValidationState({
      isValidating: false,
      provider,
      stage: 'error',
      message: '',
      error
    });
  }, []);

  // Start redirect process
  const startRedirect = useCallback((provider, message = 'Redirecting to Dashboard...') => {
    setValidationState({
      isValidating: false,
      provider,
      stage: 'redirecting',
      message,
      error: null
    });
  }, []);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      provider: null,
      stage: 'idle',
      message: '',
      error: null
    });
  }, []);

  return {
    // State
    ...validationState,
    
    // Actions
    startValidation,
    markValidationSuccess,
    markValidationError,
    startRedirect,
    resetValidation
  };
};

export default useApiKeyState;