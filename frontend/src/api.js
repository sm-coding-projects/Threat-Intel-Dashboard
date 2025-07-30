import axios from 'axios';

const API_URL = 'http://localhost:5001/api'; // Backend runs on port 5001

export const getIPs = () => {
  return axios.get(`${API_URL}/ips`);
};

export const addIPsFromFile = (file, apiKey) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_URL}/ips`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-API-Key': apiKey || localStorage.getItem('shodanApiKey') || localStorage.getItem('apiKey'),
    },
  });
};

export const addIPsFromText = (text, apiKey) => {
    return axios.post(`${API_URL}/ips`, { ips: text }, {
        headers: {
            'X-API-Key': apiKey || localStorage.getItem('shodanApiKey') || localStorage.getItem('apiKey'),
        },
    }).then(response => response)
      .catch(error => {
          if (error.response) {
              return Promise.reject(error.response.data);
          }
          return Promise.reject({ error: 'Network error or backend is down.' });
      });
};

export const validateApiKey = (apiKey) => {
    return axios.post(`${API_URL}/validate-api-key`, { api_key: apiKey });
};

export const deleteIP = (ipId) => {
    return axios.delete(`${API_URL}/ips/${ipId}`);
};