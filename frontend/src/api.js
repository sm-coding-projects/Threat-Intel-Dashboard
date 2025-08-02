import axios from 'axios';
import { EventSourcePolyfill } from 'event-source-polyfill';

const API_URL = 'http://localhost:5001/api'; // Backend runs on port 5001

export const getIPs = () => {
  return axios.get(`${API_URL}/ips`);
};

export const addIPsFromFile = (file, apiKey) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const text = reader.result;
      resolve(streamIPs('file', { ips: text }, apiKey));
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const addIPsFromText = (text, apiKey) => {
    return Promise.resolve(streamIPs('text', { ips: text }, apiKey));
};

export const validateApiKey = (apiKey) => {
    return axios.post(`${API_URL}/validate-api-key`, { api_key: apiKey });
};

export const deleteIP = (ipId) => {
    return axios.delete(`${API_URL}/ips/${ipId}`);
};

export const deleteIPs = (ipIds) => {
    return axios.post(`${API_URL}/ips/bulk-delete`, { ids: ipIds });
};

export const getApiInfo = (apiKey) => {
    return axios.get(`${API_URL}/api-info`, {
        headers: {
            'X-API-Key': apiKey || localStorage.getItem('shodanApiKey') || localStorage.getItem('apiKey'),
        },
    });
};

export const streamIPs = (source, body, apiKey) => {
    const url = `${API_URL}/ips/stream`;
    const token = apiKey || localStorage.getItem('shodanApiKey') || localStorage.getItem('apiKey');
    
    return new EventSourcePolyfill(url, {
        method: 'POST',
        headers: {
            'X-API-Key': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
};