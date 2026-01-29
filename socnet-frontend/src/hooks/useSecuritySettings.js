import { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export const useSecuritySettings = () => {
    const { user, setUser } = useContext(AuthContext);

    const [email, setEmail] = useState(user?.email || '');
    const [passwordForEmail, setPasswordForEmail] = useState('');
    const [loadingEmail, setLoadingEmail] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPass, setLoadingPass] = useState(false);

    const handleUpdateEmail = async (e) => {
        e.preventDefault();

        if (!passwordForEmail) {
            toast.error('Введіть пароль для підтвердження');
            return;
        }

        setLoadingEmail(true);

        try {
            const response = await api.put('/user/email', {
                email: email,
                password: passwordForEmail
            });

            setUser(prev => ({
                ...prev,
                email: email,
                email_verified_at: null
            }));

            setPasswordForEmail('');
            toast.success(response.data.message);

        } catch (error) {
            console.error(error);
            if (error.response?.status === 422) {
                const msg = error.response.data.message || 'Помилка валідації';
                toast.error(msg);
            } else if (error.response?.status === 403) {
                toast.error('Невірний пароль');
            } else {
                toast.error('Не вдалося змінити пошту');
            }
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error('Нові паролі не співпадають!');
        }

        setLoadingPass(true);

        try {
            const response = await api.put('/user/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });

            toast.success(response.data.message);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors.current_password) toast.error(errors.current_password[0]);
                else if (errors.password) toast.error(errors.password[0]);
                else toast.error('Перевірте введені дані');
            } else {
                toast.error('Щось пішло не так');
            }
        } finally {
            setLoadingPass(false);
        }
    };

return {
        user,
        email, setEmail,
        passwordForEmail, setPasswordForEmail,
        loadingEmail, handleUpdateEmail,
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        loadingPass, handleUpdatePassword
    };
};