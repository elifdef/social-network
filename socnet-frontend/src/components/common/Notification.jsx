import { useEffect } from 'react';
import { useNotificationText } from '../../hooks/useNotificationText';

export default function Notification({ notification, onClose }) {
    const { getNotificationData } = useNotificationText();

    useEffect(() => {
        const timer = setTimeout(() => onClose(), 7000); // 7 секунд
        return () => clearTimeout(timer);
    }, [onClose]);

    const { actionText, linkText } = getNotificationData(notification.type, notification);
    const fullText = `${actionText} ${linkText || ''}`.trim();

    return (
        <div className="socnet-toast">
            <img
                src={notification.user_avatar}
                alt="avatar"
                className="socnet-toast-avatar"
            />
            <div className="socnet-toast-content">
                <span className="socnet-toast-name">
                    {notification.user_first_name} {notification.user_last_name}
                </span>

                <span className="socnet-toast-text">
                    {fullText}
                </span>

                {notification.post_snippet && (
                    <span className="socnet-toast-snippet">
                        "{notification.post_snippet}"
                    </span>
                )}
            </div>
        </div>
    );
}