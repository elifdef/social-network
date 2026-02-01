import { useState } from 'react';
import api from '../api/axios';
import { notifyError, notifyInfo } from "../components/Notify";

const EmailVerificationBanner = ({ user }) => {
    const [loading, setLoading] = useState(false);
    if (!user || user.email_verified_at) return null;

    const handleResend = async () => {
        setLoading(true);
        try {
            await api.post('/email/verification-notification');
            notifyInfo('Підтвердження надіслано на вашу пошту');
        } catch (error) {
            notifyError('Помилка відправки.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="email-verify-block">
            Ваша пошта не підтверджена. Деякі функції можуть бути недоступні.
            <button
                onClick={handleResend}
                disabled={loading}>
                {loading ? 'Відправка...' : 'Надіслати лист'}
            </button>
        </div>
    );
};

export default EmailVerificationBanner;