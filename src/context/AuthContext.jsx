import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, startTokenRefreshTimer, stopTokenRefreshTimer } from '../services/api';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch full user profile from /me endpoint
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await authApi.get('/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = response.data;
            console.log('[Auth] Full /me response:', JSON.stringify(userData, null, 2));
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            console.log('[Auth] User profile loaded:', userData.username, 'Roles:', userData.roles);
            return userData;
        } catch (error) {
            console.error('[Auth] Failed to fetch user profile:', error);
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');
            if (token) {
                // Restore from localStorage immediately for fast UI
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch {
                        // ignore parse error
                    }
                }
                startTokenRefreshTimer();
                // Fetch fresh profile in background (gets roles, etc.)
                await fetchUserProfile();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, email, password) => {
        console.log('[Auth] Login attempt for:', email);
        try {
            const response = await authApi.post('/login', { username, email, password });
            console.log('[Auth] Login response data received');
            const { accessToken, refreshToken, userId, username: uname, email: userEmail, emailVerified } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Set basic user data immediately
            const basicUserData = { id: userId, username: uname, email: userEmail, emailVerified };
            localStorage.setItem('user', JSON.stringify(basicUserData));
            setUser(basicUserData);
            startTokenRefreshTimer();

            // Fetch full profile with roles
            const fullProfile = await fetchUserProfile();
            return fullProfile || basicUserData;

        } catch (error) {
            console.error('[Auth] Login failed:', error.response?.status, error.response?.data?.message || error.message);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        const response = await authApi.post('/register', { username, email, password });
        return response.data;
    };

    const logout = () => {
        stopTokenRefreshTimer();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
