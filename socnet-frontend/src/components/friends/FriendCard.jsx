import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function FriendCard({ user, viewMode, onAction }) {
    const { t } = useTranslation();

    const renderButtons = () => {
        const btnClass = "vk-friends-btn";

        if (viewMode === 'my') {
            return (
                <>
                    <button
                        className={`${btnClass} vk-friends-btn-danger`}
                        onClick={() => onAction('delete', user.username)}
                    >
                        {t('common.delete')}
                    </button>
                    <button
                        className={`${btnClass} vk-friends-btn-secondary`}
                        onClick={() => onAction('block', user.username)}
                    >
                        {t('common.to_block')}
                    </button>
                </>
            );
        }

        if (viewMode === 'requests') {
            return (
                <>
                    <button
                        className={`${btnClass} vk-friends-btn-primary`}
                        onClick={() => onAction('accept', user.username)}
                    >
                        {t('common.accept')}
                    </button>
                    <button
                        className={`${btnClass} vk-friends-btn-secondary`}
                        onClick={() => onAction('cancel_request', user.username)}
                    >
                        {t('common.dismiss')}
                    </button>
                </>
            );
        }

        if (viewMode === 'subscriptions') {
            return (
                <button
                    className={`${btnClass} vk-friends-btn-secondary`}
                    onClick={() => onAction('cancel_request', user.username)}
                >
                    {t('common.cancel')}
                </button>
            );
        }

        if (viewMode === 'blocked') {
            return (
                <button
                    className={`${btnClass} vk-friends-btn-primary`}
                    onClick={() => onAction('unblock', user.username)}
                >
                    {t('common.to_unblock')}
                </button>
            );
        }

        switch (user.friendship_status) {
            case 'friends':
                return (
                    <span className="vk-friends-status">{t('common.your_friends')}</span>
                );

            case 'pending_sent':
                return (
                    <button
                        className={`${btnClass} vk-friends-btn-secondary`}
                        onClick={() => onAction('cancel_request', user.username)}
                    >
                        {t('common.cancel')}
                    </button>
                );

            case 'pending_received':
                return (
                    <button
                        className={`${btnClass} vk-friends-btn-primary`}
                        onClick={() => onAction('accept', user.username)}
                    >
                        {t('common.accept')}
                    </button>
                );

            case 'blocked_by_me':
                return (
                    <button
                        className={`${btnClass} vk-friends-btn-primary`}
                        onClick={() => onAction('unblock', user.username)}
                    >
                        {t('common.to_unblock')}
                    </button>
                );

            case 'blocked_by_target':
                return (
                    <span className="vk-friends-status">{t('common.blocked')}</span>
                );

            default:
                return (
                    <button
                        className={`${btnClass} vk-friends-btn-primary`}
                        onClick={() => onAction('add', user.username)}
                    >
                        {t('common.add')}
                    </button>
                );
        }
    };

    return (
        <div className="friend-card">
            <Link to={`/${user.username}`} className="vk-friends-avatar-link">
                <img src={user.avatar} alt={user.username} className="vk-friends-avatar" />
            </Link>

            <div className="vk-friends-info">
                <Link to={`/${user.username}`} className="vk-friends-name">
                    {user.first_name} {user.last_name}
                </Link>
                <div className="vk-friends-username">@{user.username}</div>
            </div>

            <div className="vk-friends-actions">
                {renderButtons()}
            </div>
        </div>
    );
}