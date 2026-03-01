import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import Button from '../UI/Button';

export const BannedScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const { t } = useTranslation();

    const handleAppeal = () => {
        alert(t('banned.appeal_alert'));
    };

    if (!user) return null;

    return (
        <div className="socnet-fullscreen-center">
            <div className="socnet-card-wrapper banned-card">
                <img
                    src="/banned-avatar.png"
                    alt="Banned"
                    className="banned-avatar"
                />

                <h1 className="banned-title">{t('banned.title')}</h1>

                <p className="banned-message">
                    {t('banned.message', {
                        name: user.first_name,
                        username: user.username
                    })}
                </p>

                <div className="banned-reason-box">
                    <h4 className="banned-reason-label">{t('banned.reason_label')}</h4>
                    <p className="banned-reason-text">
                        {user.ban_reason || t('admin.reason_not_specified')}
                    </p>
                </div>

                <div className="banned-actions">
                    <Button onClick={handleAppeal} className="banned-btn-appeal">
                        {t('banned.appeal_btn')}
                    </Button>
                    <Button onClick={logout} className="admin-btn-danger">
                        {t('auth.signout')}
                    </Button>
                </div>
            </div>
        </div>
    );
};