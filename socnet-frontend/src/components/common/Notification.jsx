import { useEffect } from 'react';
import { useNotificationText } from '../../hooks/useNotificationText';
import { useTranslation } from 'react-i18next';
import ShieldIcon from '../../assets/shield.svg?react';

const NotificationAvatar = ({ src, isSystem }) => {
    if (isSystem) {
        return (
            <div className="socnet-toast-avatar system-toast-avatar">
                <ShieldIcon className="system-toast-icon" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt="avatar"
            className="socnet-toast-avatar toast-avatar-img"
        />
    );
};

const NotificationContent = ({ name, text, snippet }) => (
    <div className="socnet-toast-content">
        <span className="socnet-toast-name">
            {name}
        </span>
        <span className="socnet-toast-text">
            {text}
        </span>
        {snippet && (
            <span className="socnet-toast-snippet">
                "{snippet}"
            </span>
        )}
    </div>
);

export default function Notification({ notification, onClose }) {
    const { getNotificationData } = useNotificationText();
    const { t } = useTranslation();

    useEffect(() => {
        const timer = setTimeout(() => onClose(), 7000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const payload = notification.data || notification;

    const { actionText, linkText } = getNotificationData(notification.type, notification);
    const fullText = `${actionText} ${linkText || ''}`.trim();

    const isSystem = notification.type?.includes('ReportReviewed') || payload.type === 'report_reviewed';

    const senderName = isSystem
        ? t('common.moderation')
        : `${notification.user_first_name || ''} ${notification.user_last_name || ''}`.trim();

    const snippetText = payload.admin_response || payload.post_snippet;

    return (
        <div className="socnet-toast">
            <NotificationAvatar
                src={notification.user_avatar}
                isSystem={isSystem}
            />

            <NotificationContent
                name={senderName}
                text={fullText}
                snippet={snippetText}
            />
        </div>
    );
}