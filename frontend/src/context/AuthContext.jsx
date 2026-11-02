import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchProfile, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetchProfile();
            if (res?.data?.user) {
                setUser(res.data.user);
            }
        } catch (err) {
            console.error('Session restore failed:', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setAuthError(null);
        try {
            const res = await loginUser({ email, password });
            if (res?.data?.token) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
            throw new Error('Authentication failed');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed';
            setAuthError(msg);
            return { success: false, error: msg };
        }
    };

    const register = async (name, email, password) => {
        setAuthError(null);
        try {
            const res = await registerUser({ name, email, password });
            if (res?.data?.token) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
            throw new Error('Registration failed');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Registration failed';
            setAuthError(msg);
            return { success: false, error: msg };
        }
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, authError, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
