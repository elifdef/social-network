import { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { notifyError, notifySuccess } from "../components/Notify";
import { useTranslation } from 'react-i18next';

export const useSecuritySettings = () => {
    const { t } = useTranslation();
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
            notifyError(t('error.enter_confirm_password'));
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
            if (error.response?.status === 422)
                notifyError(error.response.data.message || t('error.validation'));
            else if (error.response?.status === 403)
                notifyError(t('error.invalid_password'));
            else
                notifyError(t('error.change_email'));
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword)
            return notifyError(t('error.not_match_password'));

        setLoadingPass(true);

        try {
            const response = await api.put('/user/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });

            if(response.status === 200)
                notifySuccess(t('success.password_changed'));

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;

                if (errors.current_password) 
                    notifyError(errors.current_password[0]);
                else if (errors.password) 
                    notifyError(errors.password[0]);
                else 
                    notifyError(t('error.check_entered_data'));
            } else {
                notifyError(t('error.change_password'));
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
        loadingPass, handleUpdatePassword, t
    };
};