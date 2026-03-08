import { createContext, useState, useEffect, useContext } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { AuthContext } from './AuthContext';
import api from '../api/axios';
import Notification from '../components/common/Notification';
import { audioManager } from '../utils/audioManager';

window.Pusher = Pusher;

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [activeToasts, setActiveToasts] = useState([]);
    const [incomingMessage, setIncomingMessage] = useState(null);

    const [echoInstance, setEchoInstance] = useState(null);

    useEffect(() => {
        if (user) {
            api.get('/notifications')
                .then(res => {
                    setNotifications(res.data.notifications);
                    setUnreadCount(res.data.unread_count);
                })
                .catch(err => console.error("Error load notification: ", err));
        }
    }, [user]);

    useEffect(() => {
        if (!user || !token) return;

        try {
            const echo = new Echo({
                broadcaster: 'reverb',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: import.meta.env.VITE_REVERB_PORT,
                wssPort: import.meta.env.VITE_REVERB_PORT,
                forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
                enabledTransports: ['ws', 'wss'],
                authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    }
                }
            });

            setEchoInstance(echo);

            const channelName = `App.Models.User.${user.id}`;
            const channel = echo.private(channelName);

            channel.subscribed(() => {
                console.log(`Socket connected.`);
            });

            channel.error((err) => {
                console.error(`Error connect Socket: `, err);
            });

            channel.notification((notification) => {
                const toastId = Date.now();
                const isNewMessage = notification.type === 'new_message' || notification.type?.includes('NewMessage');

                if (isNewMessage) {
                    // звук нового повідомлення
                    audioManager.playMessageSound();

                    setIncomingMessage(notification);
                    const currentParams = new URLSearchParams(window.location.search);

                    // якщо ми прямо зараз сидимо в цьому чаті - не показуємо спливаючу нотифікацію
                    if (currentParams.get('dm') === notification.chat_slug) {
                        return;
                    }

                    // якщо на іншій сторінці - показуємо і збільшуємо лічильник
                    setActiveToasts(prev => [...prev, { ...notification, toastId }]);
                    setUnreadMessagesCount(prev => prev + 1);
                    return;
                }

                const { id, type, ...customData } = notification;
                const normalizedNotif = {
                    id: id, type: type, read_at: null, created_at: new Date().toISOString(), data: customData
                };

                setNotifications(prev => [normalizedNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
                setActiveToasts(prev => [...prev, { ...notification, toastId }]);
            });

            channel.listen('.message_deleted', (event) => {
                setIncomingMessage({
                    type: 'message_deleted',
                    chat_slug: event.chat_slug,
                    message_id: event.message_id
                });
            });

            return () => {
                echo.leaveChannel(channelName);
                echo.disconnect();
                setEchoInstance(null);
            };

        } catch (error) {
            console.error("Error init Echo: ", error);
        }

    }, [user, token]);

    const markAsRead = (id) => {
        api.post(`/notifications/${id}/read`).then(() => {
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
        });
    };

    const removeToast = (toastId) => {
        setActiveToasts(prev => prev.filter(t => t.toastId !== toastId));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, unreadMessagesCount, setUnreadMessagesCount, incomingMessage, echoInstance }}>
            {children}
            <div className="socnet-toast-container">
                {activeToasts.map(toast => (
                    <Notification key={toast.toastId} notification={toast} onClose={() => removeToast(toast.toastId)} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};