/**
 * API Key Utilities
 * Centralized management for API key state and validation
 */

// API Provider configurations
export const API_PROVIDERS = {
  SHODAN: {
    key: 'shodan',
    storageKey: 'shodanApiKey',
    fallbackKey: 'apiKey', // For backward compatibility
    name: 'Shodan',
    description: 'Internet-connected device search engine'
  },
  VIRUSTOTAL: {
    key: 'virustotal',
    storageKey: 'virusTotalApiKey',
    name: 'VirusTotal',
    description: 'File and URL analysis service'
  },
  ABUSEIPDB: {
    key: 'abuseipdb',
    storageKey: 'abuseIPDBApiKey',
    name: 'AbuseIPDB',
    description: 'IP reputation and abuse reporting'
  }
};

/**
 * Get all active API keys from localStorage
 * @returns {Array} Array of active API key objects
 */
export const getActiveApiKeys = () => {
  const keys = [];
  
  Object.values(API_PROVIDERS).forEach(provider => {
    let apiKey = localStorage.getItem(provider.storageKey);
    
    // Check fallback key for backward compatibility (Shodan)
    if (!apiKey && provider.fallbackKey) {
      apiKey = localStorage.getItem(provider.fallbackKey);
    }
    
    if (apiKey && apiKey.trim()) {
      keys.push({
        provider: provider.key,
        key: apiKey,
        name: provider.name,
        description: provider.description,
        storageKey: provider.storageKey
      });
    }
  });
  
  return keys;
};

/**
 * Check if any valid API key exists
 * @returns {boolean} True if at least one API key is configured
 */
export const hasValidApiKey = () => {
  return getActiveApiKeys().length > 0;
};

/**
 * Get the count of active API keys
 * @returns {number} Number of configured API keys
 */
export const getApiKeyCount = () => {
  return getActiveApiKeys().length;
};

/**
 * Get API key for a specific provider
 * @param {string} provider - Provider key (shodan, virustotal, abuseipdb)
 * @returns {string|null} API key or null if not found
 */
export const getApiKeyForProvider = (provider) => {
  const providerConfig = Object.values(API_PROVIDERS).find(p => p.key === provider);
  if (!providerConfig) return null;
  
  let apiKey = localStorage.getItem(providerConfig.storageKey);
  
  // Check fallback key for backward compatibility
  if (!apiKey && providerConfig.fallbackKey) {
    apiKey = localStorage.getItem(providerConfig.fallbackKey);
  }
  
  return apiKey || null;
};

/**
 * Set API key for a specific provider
 * @param {string} provider - Provider key
 * @param {string} apiKey - API key to store
 * @returns {boolean} True if successfully stored
 */
export const setApiKeyForProvider = (provider, apiKey) => {
  const providerConfig = Object.values(API_PROVIDERS).find(p => p.key === provider);
  if (!providerConfig) return false;
  
  try {
    if (apiKey && apiKey.trim()) {
      localStorage.setItem(providerConfig.storageKey, apiKey.trim());
      
      // Also set fallback key for backward compatibility (Shodan)
      if (providerConfig.fallbackKey) {
        localStorage.setItem(providerConfig.fallbackKey, apiKey.trim());
      }
    } else {
      localStorage.removeItem(providerConfig.storageKey);
      
      // Also remove fallback key
      if (providerConfig.fallbackKey) {
        localStorage.removeItem(providerConfig.fallbackKey);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to store API key:', error);
    return false;
  }
};

/**
 * Remove API key for a specific provider
 * @param {string} provider - Provider key
 * @returns {boolean} True if successfully removed
 */
export const removeApiKeyForProvider = (provider) => {
  return setApiKeyForProvider(provider, null);
};

/**
 * Get the primary API key (first available, prioritizing Shodan)
 * @returns {string|null} Primary API key or null
 */
export const getPrimaryApiKey = () => {
  // Prioritize Shodan for backward compatibility
  const shodanKey = getApiKeyForProvider('shodan');
  if (shodanKey) return shodanKey;
  
  // Return first available key
  const activeKeys = getActiveApiKeys();
  return activeKeys.length > 0 ? activeKeys[0].key : null;
};

/**
 * Trigger API key update event for real-time state management
 * @param {string} provider - Provider that was updated
 * @param {string} status - Update status (validated, removed, error)
 * @param {Object} details - Additional details
 */
export const triggerApiKeyUpdate = (provider, status, details = {}) => {
  const event = new CustomEvent('apiKeyUpdate', {
    detail: {
      provider,
      status,
      timestamp: new Date().toISOString(),
      apiKeyCount: getApiKeyCount(),
      hasValidKey: hasValidApiKey(),
      ...details
    }
  });
  
  window.dispatchEvent(event);
};

/**
 * Trigger navigation to dashboard
 * @param {Object} options - Navigation options
 */
export const triggerNavigationToDashboard = (options = {}) => {
  const event = new CustomEvent('navigateToDashboard', {
    detail: {
      timestamp: new Date().toISOString(),
      ...options
    }
  });
  
  window.dispatchEvent(event);
};

/**
 * Check if navigation should be enabled based on API key status
 * @returns {boolean} True if navigation should be enabled
 */
export const shouldEnableNavigation = () => {
  return hasValidApiKey();
};

/**
 * Get API key status for UI display
 * @param {string} provider - Provider key
 * @returns {Object} Status object with state and message
 */
export const getApiKeyStatus = (provider) => {
  const apiKey = getApiKeyForProvider(provider);
  
  if (!apiKey) {
    return {
      status: 'inactive',
      message: 'Not configured',
      color: 'default'
    };
  }
  
  // For now, assume configured keys are active
  // This could be enhanced with actual validation status tracking
  return {
    status: 'active',
    message: 'Active',
    color: 'success'
  };
};

/**
 * Initialize API key state on application startup
 * @returns {Object} Initial state object
 */
export const initializeApiKeyState = () => {
  const activeKeys = getActiveApiKeys();
  const hasKeys = activeKeys.length > 0;
  
  return {
    apiKeys: activeKeys,
    count: activeKeys.length,
    hasValidKey: hasKeys,
    navigationEnabled: hasKeys,
    primaryKey: getPrimaryApiKey()
  };
};

/**
 * Clean up invalid or empty API keys from storage
 */
export const cleanupApiKeys = () => {
  Object.values(API_PROVIDERS).forEach(provider => {
    const key = localStorage.getItem(provider.storageKey);
    if (key && !key.trim()) {
      localStorage.removeItem(provider.storageKey);
    }
    
    // Also clean up fallback keys
    if (provider.fallbackKey) {
      const fallbackKey = localStorage.getItem(provider.fallbackKey);
      if (fallbackKey && !fallbackKey.trim()) {
        localStorage.removeItem(provider.fallbackKey);
      }
    }
  });
};

// Export provider configurations for use in components
export { API_PROVIDERS as default };