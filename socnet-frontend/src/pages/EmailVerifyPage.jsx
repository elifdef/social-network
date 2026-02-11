import { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const EmailVerifyPage = () => {
    const { t } = useTranslation();
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState(t('info.verification_email'));

    useEffect(() => {
        // якщо пошта вже підтверджена редірект на профіль
        if (user?.email_verified_at) {
            navigate(`/${user.username}`);
            return;
        }

        const verifyEmail = async () => {
            try {
                const query = searchParams.toString();
                const response = await api.get(`/email/verify/${id}/${hash}?${query}`);

                setStatus('success');
                setMessage(response.data.message || t('success.email_confirm'));

                const verifiedDate = new Date().toISOString();
                if (setUser) {
                    setUser(prev => ({ ...prev, email_verified_at: verifiedDate }));
                }

                // посилаємо сигнал іншій вкладці
                const channel = new BroadcastChannel('auth_channel');
                channel.postMessage({
                    type: 'EMAIL_VERIFIED',
                    date: verifiedDate
                });

                // закриваєм канал після відправки
                setTimeout(() => {
                    channel.close();
                    navigate(`/${user?.username || ''}`);
                }, 3000);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || t('email_invalid_link'));
            }
        };
        verifyEmail();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="verify-container">
            {status === 'loading' && <h2>{message}</h2>}

            {status === 'success' && (
                <h2 style={{ color: 'green' }}>{t('success.email_confirm')}</h2>
            )}

            {status === 'error' && (
                <div>
                    <h2 style={{ color: 'red' }}>{t('error.validation')}</h2>
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
};

export default EmailVerifyPage;