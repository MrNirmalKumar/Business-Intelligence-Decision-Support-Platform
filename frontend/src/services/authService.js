import api from './api';

export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const fetchProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const logoutUser = async () => {
    try {
        await api.post('/auth/logout');
    } catch (e) {
        console.warn('Logout API error:', e);
    }
    localStorage.removeItem('token');
};
