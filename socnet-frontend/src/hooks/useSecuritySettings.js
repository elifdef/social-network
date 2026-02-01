import { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { notifyError, notifySuccess } from "../components/Notify";

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
            notifyError('Введіть пароль для підтвердження');
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
            notifySuccess(response.data.message);

        } catch (error) {
            console.error(error);
            if (error.response?.status === 422) {
                const msg = error.response.data.message || 'Помилка валідації';
                notifyError(msg);
            } else if (error.response?.status === 403) {
                notifyError('Невірний пароль');
            } else {
                notifyError('Не вдалося змінити пошту');
            }
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return notifyError('Нові паролі не співпадають!');
        }

        setLoadingPass(true);

        try {
            const response = await api.put('/user/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });

            notifySuccess(response.data.message);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors.current_password) notifyError(errors.current_password[0]);
                else if (errors.password) notifyError(errors.password[0]);
                else notifyError('Перевірте введені дані');
            } else {
                notifyError('Щось пішло не так');
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