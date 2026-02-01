import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // перед загрузкою перевіряєм чи правильний токен
    useEffect(() => {
        if (token) {
            api.get('/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!user) return;

        const sendOnline = () => {
            api.post('/user/ping').catch(() => { });
        };

        // кожні 60 секунд
        const interval = setInterval(sendOnline, 60000);

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const channel = new BroadcastChannel('auth_channel');

        channel.onmessage = (event) => {
            if (event.data.type === 'EMAIL_VERIFIED' && user) {
                setUser((prevUser) => ({
                    ...prevUser,
                    email_verified_at: event.data.date
                }));
            }
        };
        return () => {
            channel.close();
        };
    }, [user]);

    const login = (newToken, newUser) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('lang', navigator.language);
        localStorage.setItem('dark_theme', true); // <-- заглушка для зміни білої/темної теми 
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        api.post('/sign-out').finally(() => {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        });
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};