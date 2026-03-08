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
        if (key.includes('ReportReviewed') || key === 'report_reviewed') key = 'report_reviewed';
        if (key.includes('NewMessage') || key === 'new_message') key = 'new_message';

        const payload = data.data || data;
        const linkUrl = data.post_id ? `/post/${data.post_id}` : null;

        switch (key) {
            case 'new_like':
                return {
                    actionText: t(`notifications.liked_${gender}`),
                    linkText: t('notifications.your_post'),
                    linkUrl
                };

            case 'new_comment':
                return {
                    actionText: t(`notifications.commented_${gender}`),
                    linkText: t('notifications.your_post'),
                    linkUrl
                };

            case 'new_friend_request':
                return {
                    actionText: t(`notifications.friend_request_${gender}`),
                    linkText: null,
                    linkUrl: null
                };

            case 'wall_post':
                return {
                    actionText: '',
                    linkText: t(`notifications.wall_post_${gender}`),
                    linkUrl
                };

            case 'repost':
                return {
                    actionText: '',
                    linkText: t(`notifications.repost_${gender}`),
                    linkUrl
                };

            case 'report_reviewed':
                return {
                    actionText: t('notifications.report_reviewed_click'),
                    linkText: '',
                    linkUrl: null
                };
            case 'new_message': {
                let snippet = payload.message_text;
                
                if (!snippet && payload.file_type) {
                    snippet = t(`notifications.sent_${payload.file_type}_${gender}`);
                }

                payload.post_snippet = snippet;

                return {
                    actionText: t(`notifications.wrote_${gender}`),
                    linkText: null,
                    linkUrl: `/messages?dm=${payload.chat_slug}`
                };
            }

            default:
                return { actionText: '', linkText: null, linkUrl: null };
        }
    };

    return { getNotificationData };
};