import axios from 'axios';

const getBaseURL = () => {
    const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
    const clean = raw.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 300000 // 5 minutes to accommodate large datasets
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
