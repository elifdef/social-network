import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EmailVerificationBanner = ({ user }) => {
    const [loading, setLoading] = useState(false);
    if (!user || user.email_verified_at) return null;

    const handleResend = async () => {
        setLoading(true);
        try {
            await api.post('/email/verification-notification');
            toast('Підтвердження надіслано на вашу пошту');
        } catch (error) {
            toast.error('Помилка відправки.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '10px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #ffeeba',
            fontSize: '14px'
        }}>
            Ваша пошта не підтверджена. Деякі функції можуть бути недоступні.
            
            <button 
                onClick={handleResend} 
                disabled={loading}
                style={{
                    marginLeft: '15px',
                    padding: '5px 10px',
                    backgroundColor: '#856404',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Відправка...' : 'Надіслати лист'}
            </button>
        </div>
    );
};

export default EmailVerificationBanner;