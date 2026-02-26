import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { notifyError, notifyInfo } from "../common/Notify";

const EmailVerificationBanner = ({ user }) => {
    if (!user || user.email_verified_at) 
        return null;

    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleResend = async () => {
        setLoading(true);
        try {
            await api.post('/email/verification-notification');
            notifyInfo(t('info.email_send_letter'));
        } catch (error) {
            notifyError(t('error.email_send'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="email-verify-block">
            {t('banner.email.text')}
            <button
                onClick={handleResend}
                disabled={loading}>
                {loading ? t('banner.email.sending') : t('banner.email.send')}
            </button>
        </div>
    );
};

export default EmailVerificationBanner;