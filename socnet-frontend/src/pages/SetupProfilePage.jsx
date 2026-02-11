import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import UserProfileCard from "../components/profile/UserProfileCard";
import FormInput from "../components/UI/FormInput"
import { notifyError } from "../components/Notify"
import { validateImageFile } from "../services/upload";
import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";

export default function SetupProfilePage() {
    const { t } = useTranslation();
    usePageTitle(t('first_setup.title'));
    const { user: authUser, login } = useContext(AuthContext);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState(undefined);
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const previewUser = {
        ...authUser, // username, email, created_at з контексту
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        birth_date: birthDate,
        avatar: preview || authUser?.avatar
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!validateImageFile(file)) return;

        setAvatarFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firstName || !birthDate) return notifyError(t('first_setup.no_data'));

        setLoading(true);
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('finish_setup', '1');
        formData.append('first_name', firstName);
        formData.append('birth_date', birthDate);
        if (lastName) formData.append('last_name', lastName);
        if (bio) formData.append('bio', bio);
        if (avatarFile) formData.append('avatar', avatarFile);

        try {
            const res = await api.post(`/users/${authUser.username}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            login(localStorage.getItem('token'), res.data.data);
            window.location.href = `/${authUser.username}`;
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ gap: '40px', padding: '40px' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
                <h2 style={{ color: '#e0e0e0' }}>{t('settings.profile_settings')}</h2>
                <p style={{ color: '#8c8c8c', marginBottom: '20px' }}>{t('first_setup.fill_details')}</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div>
                        <label className="btn" style={{ display: 'inline-block', cursor: 'pointer', background: '#3a3a3a', border: '1px solid #424242' }}>
                            {t('first_setup.upload_avatar')}
                            <FormInput type="file"
                                hidden
                                onChange={handleFileChange}
                                accept="image/*" />
                        </label>
                    </div>

                    <FormInput
                        className="input-field"
                        placeholder={`${t('common.first_name')} *`}
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required />

                    <FormInput
                        className="input-field"
                        placeholder={t('common.last_name')}
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ color: '#8c8c8c', fontSize: '12px' }}>{`${t('common.birthday')} *`}</label>
                        <FormInput type="date" className="input-field" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
                    </div>

                    <textarea className="input-field" rows="3" placeholder={t('profile.your_status')} value={bio} onChange={e => setBio(e.target.value)} />

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? t('common.saving') : t('first_setup.save_and_finish')}
                    </button>
                </form>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ position: 'sticky', top: '20px' }}>
                    <h3 style={{ color: '#e0e0e0', textAlign: 'center', marginBottom: 10 }}>{t('common.preview')}</h3>
                    <UserProfileCard currentUser={previewUser} isPreview={true} />
                </div>
            </div>
        </div>
    );
}