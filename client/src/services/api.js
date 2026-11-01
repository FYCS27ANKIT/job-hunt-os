import axios from 'axios';

// Determine the API base URL:
// 1. Explicit VITE_API_URL if set in environment
// 2. Localhost fallback if running locally
// 3. Live Render API fallback if running on production static site
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5050/api';
  }
  return 'https://job-hunt-os-api.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 35000, // 35 seconds to allow for Render free tier cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('job_hunt_os_token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => {
    // Detect if static server returned HTML (e.g. rewrite of unknown /api route)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      return Promise.reject(new Error('API route returned HTML instead of JSON. Check backend URL.'));
    }
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Server took too long to respond. Render free tier may be waking up, please retry in 15 seconds.'));
    }
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        // Token expired or invalid
      }
    }
    return Promise.reject(error);
  }
);

export default API;
