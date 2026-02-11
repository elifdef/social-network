import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import FormInput from "../UI/FormInput";
import { useTranslation } from 'react-i18next';

export default function RegisterForm() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password_confirmation: ""
    });

    const [msg, setMsg] = useState({ text: "", color: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({});
        setLoading(true);

        try {
            await api.post('/sign-up', formData);
            setMsg({
                text: (
                    <span>
                        {t('auth.you_have_registered')}{" "}
                        <Link to="/login" style={{ color: '#1d9bf0', textDecoration: 'underline' }}>{t('auth.signin')}</Link>
                    </span>
                ),
                color: "green"
            });
            setFormData({ username: "", email: "", password: "", password_confirmation: "" });
        } catch (err) {
            const errorText = err.response?.data?.message || t('error.registration');
            setMsg({ text: errorText, color: "red" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <FormInput
                    type="text"
                    name="username"
                    id="reg-username"
                    label={t('auth.username')}
                    placeholder={t('auth.username')}
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    type="email"
                    name="email"
                    id="reg-email"
                    label={t('auth.email')}
                    placeholder="Example@mail.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    type="password"
                    name="password"
                    id="reg-password"
                    label={t('auth.password')}
                    placeholder={t('auth.password')}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    type="password"
                    name="password_confirmation"
                    id="reg-confirm-password"
                    label={t('auth.password_confirmation')}
                    placeholder={t('auth.password_confirmation')}
                    autoComplete="new-password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                />

                {msg.text && (
                    <div style={{ color: msg.color, textAlign: 'center', fontSize: '14px' }}>
                        {msg.text}
                    </div>
                )}

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? t('auth.register_title') : t('auth.signup')}
                </button>
            </form>

            <p>
                {t('auth.already_have_account')} <Link to="/login" style={{ color: '#1d9bf0' }}>{t('auth.signin')}</Link>
            </p>
        </>
    );
}