import { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const EmailVerifyPage = () => {
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Перевіряємо вашу пошту...');

    useEffect(() => {
        const verifyEmail = async () => {
            if (user?.email_verified_at) {
                setStatus('success');
                setMessage('Пошта вже підтверджена!');
                setTimeout(() => navigate(`/${user.username}`), 1000);
                return;
            }

            try {
                const query = searchParams.toString();
                const url = `/email/verify/${id}/${hash}?${query}`;
                const response = await api.get(url);
                setStatus('success');
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate(user && user.username ? `/${user.username}` : '/login');
                }, 2000);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Щось пішло не так.');
            }
        };
        verifyEmail();
    }, [id, hash, searchParams, navigate]);

    return (
        <div className="verify-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            {status === 'loading' && <h2>⏳ {message}</h2>}

            {status === 'success' && (
                <h2 style={{ color: 'green' }}>✅ {message}</h2>
            )}

            {status === 'error' && (
                <div>
                    <h2 style={{ color: 'red' }}>❌ Помилка</h2>
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
};

export default EmailVerifyPage;