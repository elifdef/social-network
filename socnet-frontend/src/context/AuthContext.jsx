import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { mapUser } from "../services/mappers";
import ErrorState from "../components/common/ErrorState";
import i18n, { getSystemLanguage } from '../i18n'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [initError, setInitError] = useState(false);

    // перед загрузкою перевіряєм чи правильний токен і чи не лежить бекенд
    useEffect(() => {
        if (token) {
            setLoading(true);
            setInitError(false);

            api.get('/me')
                .then(res => {
                    setUser(mapUser(res.data));
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.response && err.response.status === 401) {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                        setLoading(false);
                    } else {
                        setInitError(true);
                        setLoading(false);
                    }
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    // для точного визначення статусу онлайна користувача
    useEffect(() => {
        if (!user)
            return;

        const sendOnline = () => {
            api.post('/user/ping').catch(() => { });
        };

        const interval = setInterval(sendOnline, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // для моментальної зміни статусу підтвердження пошти
    useEffect(() => {
        if (!user)
            return;

        const channel = new BroadcastChannel('auth_channel');
        channel.onmessage = (event) => {
            if (event.data.type === 'EMAIL_VERIFIED' && user)
                setUser((prevUser) => ({
                    ...prevUser,
                    email_verified_at: event.data.date
                }));
        };
        return () => {
            channel.close();
        };
    }, [user]);

    const login = (newToken, newUser) => {
        localStorage.setItem('token', newToken);
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', getSystemLanguage());
        }
        localStorage.setItem('dark_theme', true); // <-- заглушка для зміни білої/темної теми 
        setToken(newToken);
        setUser(newUser);
        setInitError(false);
    };

    const logout = () => {
        api.post('/sign-out').finally(() => {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        });
    };

    // якщо бек лежить
    if (initError) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ErrorState
                    title={i18n.t('error.server_down')}
                    description={i18n.t('error.server_down_desc')}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    if (loading)
        return <div style={{ height: '100vh', background: '#fff' }}></div>;

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};