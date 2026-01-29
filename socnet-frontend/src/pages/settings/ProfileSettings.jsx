import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from "react-hot-toast";
import FormInput from "../../components/FormInput"
import api from '../../api/axios';

const ProfileSettings = () => {
    const { user, setPreviewUser, fetchUser } = useOutletContext();
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
            // 5 МБ = 5 * 1024 * 1024 байт
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Файл занадто великий. Максимальний розмір: 5 МБ.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Будь ласка, завантажте зображення.');
                return;
            }

            setPreviewUser(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
            setFormData(prev => ({ ...prev, avatarFile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            fetchUser();
            toast.success('Зміни успішно збережено!');
        } catch (error) {
            toast.error('Помилка при збереженні');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
                <label className="form-label">Аватар</label>
                <FormInput type="file" onChange={handleFileChange} className="form-input" accept="image/*" />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Ім'я</label>
                    <FormInput name="first_name" value={formData.first_name} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Прізвище</label>
                    <FormInput name="last_name" value={formData.last_name} onChange={handleChange} className="form-input" />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Про себе (Bio)</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="form-textarea"></textarea>
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