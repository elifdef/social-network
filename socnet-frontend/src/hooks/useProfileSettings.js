import { useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from "../context/AuthContext";
import api from '../api/axios';
import { notifySuccess, notifyError, notifyLoading, dismissToast, notifyInfo } from "../components/common/Notify";
import { validateImageFile } from "../services/upload";

export const useProfileSettings = (isSetupMode = false) => {
    const { t } = useTranslation();
    const { user, setUser } = useContext(AuthContext);

    const [previewUser, setPreviewUser] = useState(user);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        bio: user?.bio || '',
        birth_date: user?.birth_date || '',
        country: user?.country || '',
        gender: user?.gender || '0',
        avatarFile: null,
    });

    const isChanged = useMemo(() => {
        if (formData.first_name !== (user?.first_name || '')) return true;
        if (formData.last_name !== (user?.last_name || '')) return true;
        if ((formData.bio || '') !== (user?.bio || '')) return true;
        if ((formData.birth_date || '') !== (user?.birth_date || '')) return true;
        if ((formData.country || '') !== (user?.country || '')) return true;
        if (String(formData.gender) !== String(user?.gender || '0')) return true;
        if (formData.avatarFile) return true;
        return false;
    }, [formData, user]);

    const canSubmit = useMemo(() => {
        if (isSetupMode) {
            return isChanged
                && formData.first_name.trim() !== ''
                && formData.birth_date !== ''
                && String(formData.gender) !== '0';
        }
        return isChanged;
    }, [isChanged, isSetupMode, formData.first_name, formData.birth_date, formData.gender]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numberFields = ['gender'];
        const finalValue = numberFields.includes(name) ? Number(value) : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        setPreviewUser(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !validateImageFile(file)) return;

        setPreviewUser(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
        setFormData(prev => ({ ...prev, avatarFile: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // якщо користувач зніме disabled через DevTools
        if (!canSubmit) {
            notifyInfo(t('settings.same_info'));

            setPreviewUser(prev => ({ ...prev, avatar: "https://substackcdn.com/image/fetch/$s_!N8t_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25d56fff-096b-4f24-a996-149cc73e9cf6_1055x1212.jpeg" }));

            setTimeout(() => {
                window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1";
            }, 8000);
            return;
        }

        const toastId = notifyLoading(t('common.saving'));

        const data = new FormData();
        data.append('_method', 'PATCH');

        if (isSetupMode) data.append('finish_setup', '1');

        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name || '');
        data.append('birth_date', formData.birth_date || '');
        data.append('bio', formData.bio || '');
        data.append('country', formData.country || '');
        data.append('gender', formData.gender || '0');

        if (formData.avatarFile) data.append('avatar', formData.avatarFile);

        try {
            const res = await api.post(`/users/${user.username}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(prev => ({ ...prev, ...previewUser, is_setup_complete: true }));

            if (isSetupMode) {
                window.location.href = `/${user.username}`;
            } else {
                notifySuccess(t('success.changes_saved'));
                setFormData(prev => ({ ...prev, avatarFile: null }));
            }
        } catch (error) {
            notifyError(error.response?.data?.message || t('error.save_changes'));
        } finally {
            dismissToast(toastId);
        }
    };

    return {
        formData,
        previewUser,
        canSubmit,
        handleChange,
        handleFileChange,
        handleSubmit,
        avatarFile: formData.avatarFile
    };
};