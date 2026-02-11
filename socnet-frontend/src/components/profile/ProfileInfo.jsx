import { useTranslation } from 'react-i18next';
import { useDateFormatter } from "../../hooks/useDateFormatter"

export default function ProfileInfo({ user, displayBirth, displayCountry, displayGender, showFriendsBlock }) {
    const { t } = useTranslation();
    const formatDate = useDateFormatter();
    return (
        <>
            <div className="vk-info-block">
                <h4 className="vk-section-title">{t('profile.information')}</h4>
                <div className="vk-info-row">
                    <div className="vk-label">{t('common.birthday')}:</div>
                    <div className="vk-value">{formatDate(displayBirth, { withTime: false, useRelative: false })}</div>
                </div>
                <div className="vk-info-row">
                    <div className="vk-label">{t('common.country')}:</div>
                    <div className="vk-value">{displayCountry}</div>
                </div>
                <div className="vk-info-row">
                    <div className="vk-label">{t('profile.joined')}:</div>
                    <div className="vk-value">{formatDate(user.created_at, { withTime: true, forceYear: true })}</div>
                </div>
                <div className="vk-info-row">
                    <div className="vk-label">{t('common.gender')}:</div>
                    <div className="vk-value">{displayGender}</div>
                </div>
            </div>

            {showFriendsBlock && (
                <div className="vk-info-block">
                    <h4 className="vk-section-title">{t('common.friends')}</h4>
                    <div className="vk-info-row">
                        <div className="vk-label">{t('common.friends')}</div>
                        <div className="vk-value">{user.friends_count || 0}</div>
                    </div>
                    <div className="vk-info-row">
                        <div className="vk-label">{t('profile.subscribers')}</div>
                        <div className="vk-value">{user.followers_count || 0}</div>
                    </div>
                </div>
            )}
        </>
    );
}