import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useMatch } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import { notifyError, notifyInfo } from "../common/Notify";
import { AuthContext } from "../../context/AuthContext";

const EmailVerificationBanner = ({ user }) => {
    const { setUser } = useContext(AuthContext);
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const match = useMatch('/email-verify/:id/:hash');

    const [loading, setLoading] = useState(false);

    const [verifyStatus, setVerifyStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (match && !user?.email_verified_at && verifyStatus === 'idle') {
            const verifyEmail = async () => {
                setVerifyStatus('verifying');
                setStatusMessage(t('info.verification_email'));

                try {
                    const query = location.search;
                    await AuthService.verifyEmail(match.params.id, match.params.hash, query);

                    const verifiedDate = new Date().toISOString();

                    const channel = new BroadcastChannel('auth_channel');
                    channel.postMessage({ type: 'EMAIL_VERIFIED', date: verifiedDate });
                    channel.close();

                    setVerifyStatus('success');
                    setStatusMessage(t('success.email_confirm'));

                    setTimeout(() => {
                        setVerifyStatus('hidden');
                        setUser(prev => ({ ...prev, email_verified_at: verifiedDate }));
                        navigate('/', { replace: true });
                    }, 5000);

                } catch (error) {
                    setVerifyStatus('error');
                    setStatusMessage(t('error.email_invalid_link'));
                    setTimeout(() => navigate('/', { replace: true }), 3000);
                }
            };
            verifyEmail();
        }
    }, [match, location.search, user, verifyStatus, navigate, setUser, t]);

    if (!user || verifyStatus === 'hidden' || (user.email_verified_at && verifyStatus === 'idle')) {
        return null;
    }

    if (!user || (user.email_verified_at && verifyStatus !== 'success')) {
        return null;
    }

    const handleResend = async () => {
        setLoading(true);
        try {
            await AuthService.resendVerification();
            notifyInfo(t('info.email_send_letter'));
        } catch (error) {
            notifyError(t('error.email_send'));
        } finally {
            setLoading(false);
        }
    };

    if (verifyStatus === 'verifying') {
        return (
            <div className="email-verify-block">
                <span className="email-verify-text pulse">{statusMessage}</span>
            </div>
        );
    }

    if (verifyStatus === 'success') {
        return (
            <div className="email-verify-block success-animation">
                <span className="email-verify-text">{statusMessage}</span>
            </div>
        );
    }

    if (verifyStatus === 'error') {
        return (
            <div className="email-verify-block error">
                <span className="email-verify-text">{statusMessage}</span>
                <button className="email-verify-btn" onClick={() => setVerifyStatus('idle')}>OK</button>
            </div>
        );
    }

    return (
        <div className="email-verify-block">
            <span className="email-verify-text">
                {t('banner.email.text')}
            </span>
            <button
                className="email-verify-btn"
                onClick={handleResend}
                disabled={loading}
            >
                {loading ? t('banner.email.sending') : t('banner.email.send')}
            </button>
        </div>
    );
};

export default EmailVerificationBanner;