import { useTranslation } from 'react-i18next';

export const useNotificationText = () => {
    const { t } = useTranslation();

    const getNotificationData = (typeKey, data) => {
        if (!data) return { actionText: '', linkText: null, linkUrl: null };

        const gender = data.user_gender === 2 ? 'female' : 'male';
        let key = typeKey || '';

        if (key.includes('NewLike')) key = 'new_like';
        if (key.includes('NewComment')) key = 'new_comment';
        if (key.includes('NewFriendRequest')) key = 'new_friend_request';
        if (key.includes('NewWallPost') || key === 'wall_post') key = 'wall_post';
        if (key.includes('NewRepost') || key === 'repost') key = 'repost';

        const linkUrl = data.post_id ? `/post/${data.post_id}` : null;

        switch (key) {
            case 'new_like':
                return {
                    actionText: t('notifications.liked', { context: gender }),
                    linkText: t('notifications.your_post'),
                    linkUrl
                };

            case 'new_comment':
                return {
                    actionText: t('notifications.commented', { context: gender }),
                    linkText: t('notifications.your_post'),
                    linkUrl
                };

            case 'new_friend_request':
                return {
                    actionText: t('notifications.friend_request', { context: gender }),
                    linkText: null,
                    linkUrl: null
                };

            case 'wall_post':
                return {
                    actionText: '',
                    linkText: t('notifications.wall_post', { context: gender }),
                    linkUrl
                };

            case 'repost':
                return {
                    actionText: '',
                    linkText: t('notifications.repost', { context: gender }),
                    linkUrl
                };

            default:
                return { actionText: '', linkText: null, linkUrl: null };
        }
    };

    return { getNotificationData };
};