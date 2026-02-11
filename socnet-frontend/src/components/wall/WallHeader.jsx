import { useTranslation } from 'react-i18next';

export default function WallHeader({ postsCount }) {
    const { t } = useTranslation();

    return (
        <div className="vk-wall-header">
            <span className="vk-wall-title">{t('wall.title')}</span>
            <span className="vk-wall-count">
                {t('wall.posts_count', { count: postsCount })}
            </span>
        </div>
    );
}