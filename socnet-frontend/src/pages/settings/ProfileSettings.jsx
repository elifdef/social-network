import { useState, useEffect, useContext, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import FormInput from "../../components/UI/FormInput"
import { AuthContext } from "../../context/AuthContext"
import api from '../../api/axios';
import { notifySuccess, notifyError, notifyLoading, dismissToast, notifyInfo } from '../../components/Notify';
import { validateImageFile } from "../../services/upload";
import { useTranslation } from 'react-i18next';

const ProfileSettings = () => {
    const { t } = useTranslation();
    const { user, setUser } = useContext(AuthContext);
    const { previewUser, setPreviewUser } = useOutletContext();
    const [countries, setCountries] = useState([]);

    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        country_id: user.country ? user.country.id : '',
        avatarFile: null,
        gender: Number(user.gender) || 0,
    });

    useEffect(() => {
        api.get('/countries').then(res => setCountries(res.data));
    }, []);

    useEffect(() => {
        if (user) setPreviewUser(user);
    }, [user]);

    const isChanged = useMemo(() => {
        if (formData.first_name !== (user.first_name || ''))
            return true;

        if (formData.last_name !== (user.last_name || ''))
            return true;

        const userBio = user.bio || '';
        const formBio = formData.bio || '';

        if (formBio !== userBio)
            return true;

        const userCountryId = user.country ? String(user.country.id) : '';
        const formCountryId = String(formData.country_id);

        if (formCountryId !== userCountryId)
            return true;

        if (formData.avatarFile)
            return true;

        const userGender = user.gender || 0;
        const formGender = formData.gender;

        if (Number(formGender) !== Number(userGender))
            return true;

        return false;
    }, [formData, user]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        setPreviewUser(prev => {
            let updates = { [name]: value };
            updates.gender = Number(updates.gender);

            if (name === 'country_id') {
                const selected = countries.find(c => c.id == value);
                updates.country = selected ? { ...selected } : null;
            }
            return { ...prev, ...updates };
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file)
            return;

        if (!validateImageFile(file))
            return;

        setPreviewUser(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
        setFormData(prev => ({ ...prev, avatarFile: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // якщо користувач зніме disabled через DevTools
        if (!isChanged) {
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
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);

        data.append('bio', formData.bio || '');

        if (formData.country_id) data.append('country_id', formData.country_id);
        if (formData.avatarFile) data.append('avatar', formData.avatarFile);
        if (Number(formData.gender) > 0) data.append('gender', formData.gender);

        try {
            await api.post(`/users/${user.username}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(prev => ({ ...prev, ...previewUser }));
            notifySuccess(t('success.changes_saved'));
            setFormData(prev => ({ ...prev, avatarFile: null }));

        } catch (error) {
            notifyError(error.response?.data?.message || t('error.save_changes'));
            setPreviewUser(user);
        } finally {
            dismissToast(toastId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="vk-settings-form">
            <div className="vk-form-group">
                <label className="vk-form-label">{t('common.avatar')}</label>
                <FormInput
                    type="file"
                    onChange={handleFileChange}
                    className="vk-form-input"
                    accept="image/*"
                />
            </div>

            <div className="vk-form-row">
                <div className="vk-form-group">
                    <label className="vk-form-label">{t('common.first_name')}</label>
                    <FormInput
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="vk-form-input"
                        maxLength={50}
                        required
                    />
                </div>
                <div className="vk-form-group">
                    <label className="vk-form-label">{t('common.last_name')}</label>
                    <FormInput
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="vk-form-input"
                        maxLength={50}
                    />
                </div>
            </div>

            <div className="vk-form-group">
                <label className="vk-form-label">{t('common.gender')}</label>
                <div className="vk-settings-group">
                    <label className="vk-radio-label">
                        <input
                            type="radio"
                            name="gender"
                            value={1}
                            checked={Number(formData.gender) === 1}
                            onChange={handleChange}
                        />
                        {t('common.gender_male')}
                    </label>

                    <label className="vk-radio-label">
                        <input
                            type="radio"
                            name="gender"
                            value={2}
                            checked={Number(formData.gender) === 2}
                            onChange={handleChange}
                        />
                        {t('common.gender_female')}
                    </label>
                </div>
            </div>

            <div className="vk-form-group">
                <label className="vk-form-label">{t('settings.about_me')}</label>
                <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    className="vk-form-textarea"
                    maxLength={1000}
                ></textarea>
            </div>

            <div className="vk-form-group">
                <label className="vk-form-label">{t('common.country')}</label>
                <select name="country_id" value={formData.country_id} onChange={handleChange} className="vk-form-select">
                    <option value="">{t('settings.not_selected')}</option>
                    {countries.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.emoji} {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="vk-btn-save"
                disabled={!isChanged}
            >
                {t('common.save')}
            </button>
        </form>
    );
};

export default ProfileSettings;