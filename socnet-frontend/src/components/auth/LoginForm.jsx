import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../UI/FormInput";
import { useAuthForms } from "../../hooks/useAuthForms";
import { useTranslation } from 'react-i18next';

export default function LoginForm() {
    const { t } = useTranslation();
    const { loginUser, loading, error, setError } = useAuthForms();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error)
            setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(formData.email, formData.password);
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <FormInput
                    type="email"
                    name="email"
                    id="login-email"
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
                    id="login-password"
                    label={t('auth.password')}
                    placeholder={t('auth.password')}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {error && <div style={{ color: '#ff3347', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <button className="btn" disabled={loading}>
                    {loading ? t('auth.login_title') : t('auth.signin')}
                </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                {t('auth.not_have_account')} <Link to="/register" style={{ color: '#1d9bf0' }}>{t('auth.signup')}</Link>
            </p>
        </>
    );
}