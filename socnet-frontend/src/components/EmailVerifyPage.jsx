import { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const EmailVerifyPage = () => {
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { user, setUser } = useContext(AuthContext);

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Перевіряємо вашу пошту...');

    useEffect(() => {
        const verifyEmail = async () => {
            if (user?.email_verified_at) {
                navigate(`/${user.username}`);
                return;
            }

            try {
                const query = searchParams.toString();
                const url = `/email/verify/${id}/${hash}?${query}`;
                const response = await api.get(url);

                setStatus('success');
                setMessage(response.data.message);

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
                    navigate(`/${user?.username}`)
                }, 20);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Щось пішло не так.');
            }
        };
        verifyEmail();
    }, []);

    return (
        <div className="verify-container">
            {status === 'loading' && <h2>{message}</h2>}

            {status === 'success' && (
                <h2 style={{ color: 'green' }}>Пошту успішно підтверджено!</h2>
            )}

            {status === 'error' && (
                <div>
                    <h2 style={{ color: 'red' }}>Помилка підтвердження.</h2>
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
};

export default EmailVerifyPage;