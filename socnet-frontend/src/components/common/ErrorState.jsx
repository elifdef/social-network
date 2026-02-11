import { useTranslation } from 'react-i18next';

export default function ErrorState({ title, description, onRetry }) {
    const { t } = useTranslation();
    
    const handleRetry = onRetry || (() => window.location.reload());

    return (
        <div className="vk-feed-empty" style={{ margin: '20px auto', maxWidth: '500px' }}>
            <h3>{title || t('error.connection')}</h3>
            <p>{description || t('error.loading', { resource: t('common.profile') })}</p>
            
            <div className="vk-feed-actions">
                <button
                    className="vk-btn-small"
                    onClick={handleRetry}
                >
                    {t('common.reload_page')}
                </button>
            </div>
        </div>
    );
}