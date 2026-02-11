import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '../../hooks/useDateFormatter';

export default function ProfileHeader({ user }) {
    const { t } = useTranslation();
    const formatDate = useDateFormatter();

    const getStatusText = () => {
        if (user.is_online)
            return t('profile.online');

        if (!user.last_seen)
            return t('profile.offline', { time: '' });

        const dateStr = formatDate(user.last_seen);

        if (user.gender === 1) return t('profile.status.last_seen_m', { time: dateStr });
        if (user.gender === 2) return t('profile.status.last_seen_f', { time: dateStr });

        return t('profile.status.last_seen_n', { time: dateStr });
    };

    return (
        <div className="vk-name-row">
            <h2 className="vk-name">
                {user.first_name} {user.last_name}
                <span className="vk-nick"> @{user.username}</span>
            </h2>

            <span className={`vk-status ${user.is_online ? 'online' : 'offline'}`}>
                {getStatusText()}
            </span>
        </div>
    );
}