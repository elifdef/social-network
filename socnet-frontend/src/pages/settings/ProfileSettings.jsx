import { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import FormInput from "../../components/FormInput"
import { AuthContext } from "../../context/AuthContext"
import api from '../../api/axios';
import { notifySuccess, notifyWarn, notifyError, notifyLoading, dismissToast } from '../../components/Notify';

const ProfileSettings = () => {
    const { user, setUser } = useContext(AuthContext);
    const { previewUser, setPreviewUser } = useOutletContext();
    const [countries, setCountries] = useState([]);

    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        country_id: user.country ? user.country.id : '',
    });

    useEffect(() => {
        api.get('/countries').then(res => setCountries(res.data));
    }, []);

    useEffect(() => {
        if (user)
            setPreviewUser(user);
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        setPreviewUser(prev => {
            let updates = { [name]: value };

            if (name === 'country_id') {
                const selected = countries.find(c => c.id == value);
                updates.country = selected ? { ...selected } : null;
            }
            return { ...prev, ...updates };
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                notifyWarn('Файл занадто великий. Максимальний розмір: 5 МБ.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                notifyError('Будь ласка, завантажте зображення.');
                return;
            }

            setPreviewUser(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
            setFormData(prev => ({ ...prev, avatarFile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = notifyLoading("Збереження...");
        const data = new FormData();
        data.append('_method', 'PATCH');
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('bio', formData.bio);

        if (formData.country_id) data.append('country_id', formData.country_id);
        if (formData.avatarFile) data.append('avatar', formData.avatarFile);

        try {
            await api.post(`/users/${user.username}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(prevUser => ({
                ...prevUser,      // старі дані
                ...previewUser    // нові дані
            }));
            notifySuccess('Зміни успішно збережено!');
        } catch (error) {
            notifyError(error.response?.data?.message || "Помилка збереження");
            console.log(error);
            setPreviewUser(user);
            notifyError('Помилка при збереженні');
        } finally {
            dismissToast(toastId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
                <label className="form-label">Аватар</label>
                <FormInput
                    type="file"
                    onChange={handleFileChange}
                    className="form-input"
                    accept="image/*"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Ім'я</label>
                    <FormInput
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="form-input"
                        maxLength={50}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Прізвище</label>
                    <FormInput
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="form-input"
                        maxLength={50}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Про себе (Bio)</label>
                <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-textarea"
                    maxLength={1000}
                ></textarea>
            </div>

            <div className="form-group">
                <label className="form-label">Країна</label>
                <select name="country_id" value={formData.country_id} onChange={handleChange} className="form-select">
                    <option value="">Не обрано</option>
                    {countries.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.emoji} {c.name}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className="btn-save">Зберегти зміни</button>
        </form>
    );
};

export default ProfileSettings;