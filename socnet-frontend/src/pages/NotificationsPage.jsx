import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDateFormatter } from "../hooks/useDateFormatter";
import { NotificationContext } from "../context/NotificationContext";
import { usePageTitle } from '../hooks/usePageTitle';
import { useNotificationText } from '../hooks/useNotificationText';
import ReportResultModal from '../components/common/ReportResultModal';
import ShieldIcon from '../assets/shield.svg?react';

const ListAvatar = ({ src, isSystem }) => {
    if (isSystem) {
        return (
            <div className="socnet-notification-avatar system-avatar">
                <ShieldIcon/> 
            </div>
        );
    }

    return <img src={src} className="socnet-notification-avatar" alt="avatar" />;
};

const NotificationListItem = ({ notif, handleNotificationClick, getNotificationData, formatDate }) => {
    const { t } = useTranslation();
    const isUnread = !notif.read_at;
    const data = notif.data || {};
    const { actionText, linkText, linkUrl } = getNotificationData(notif.type, data);
    const isSystem = notif.type?.includes('ReportReviewed') || data.type === 'report_reviewed';
    const senderName = isSystem ? t('common.moderator') : `${data.user_first_name} ${data.user_last_name || ''}`.trim();
    const snippetText = data.admin_response || data.post_snippet;

    return (
        <div
            className={`socnet-notification-item ${isUnread ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notif, data, isSystem)}
        >
            {isSystem ? (
                <div onClick={(e) => e.stopPropagation()}>
                    <ListAvatar isSystem={true} />
                </div>
            ) : (
                <Link to={`/${data.user_username}`} onClick={(e) => e.stopPropagation()}>
                    <ListAvatar src={data.user_avatar} isSystem={false} />
                </Link>
            )}

            <div className="socnet-notification-content">
                <div>
                    {isSystem ? (
                        <span className="socnet-comment-author">
                            {senderName}
                        </span>
                    ) : (
                        <Link
                            to={`/${data.user_username}`}
                            className="socnet-comment-author"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {senderName}
                        </Link>
                    )}
                    {' '}
                    <span>
                        {actionText}
                        {actionText && linkText ? ' ' : ''}
                        {linkUrl && linkText ? (
                            <Link to={linkUrl} className="socnet-link" onClick={(e) => e.stopPropagation()}>
                                {linkText}
                            </Link>
                        ) : (
                            linkText
                        )}
                    </span>
                </div>

                {snippetText && (
                    <div className="socnet-notification-snippet">
                        "{snippetText}"
                    </div>
                )}

                <div className="socnet-notification-date">
                    {formatDate(notif.created_at)}
                </div>
            </div>

            {isUnread && (
                <div className="socnet-notification-dot" title={t('notifications.mark_read')}></div>
            )}
        </div>
    );
};

export default function NotificationsPage() {
    const { t } = useTranslation();
    const { notifications, markAsRead, unreadCount } = useContext(NotificationContext);
    const formatDate = useDateFormatter();
    const { getNotificationData } = useNotificationText();

    usePageTitle(t('notifications.my_notifications'));

    const [selectedReport, setSelectedReport] = useState(null);

    const handleNotificationClick = (notif, payload, isSystemReport) => {
        if (!notif.read_at) markAsRead(notif.id);

        if (isSystemReport) {
            setSelectedReport(payload);
        }
    };

    return (
        <div className="socnet-card-wrapper">
            <h1 className="socnet-section-title socnet-wall-header">
                <span>{t('notifications.my_notifications')}</span>
                {unreadCount > 0 && <span className="socnet-wall-count">+{unreadCount}</span>}
            </h1>

            {notifications.length === 0 ? (
                <div className="socnet-empty-state">
                    <p>{t('notifications.empty')}</p>
                </div>
            ) : (
                <div className="socnet-notification-list">
                    {notifications.map((notif) => (
                        <NotificationListItem
                            key={notif.id}
                            notif={notif}
                            handleNotificationClick={handleNotificationClick}
                            getNotificationData={getNotificationData}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            )}

            <ReportResultModal
                payload={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
}