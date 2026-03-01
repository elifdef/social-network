import Footer from "../components/layout/Footer";
import RegisterForm from "../components/auth/RegisterForm";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const { t } = useTranslation();
    usePageTitle(t('auth.signup'));

    return (
        <div className="socnet-fullscreen-center">
            <div className="socnet-auth-card" style={{ maxWidth: '400px' }}>
                <div className="socnet-auth-header">
                    <h1 className="socnet-auth-title">{t('auth.signup')}</h1>
                </div>
                <RegisterForm />
            </div>
            <Footer />
        </div>
    );
}