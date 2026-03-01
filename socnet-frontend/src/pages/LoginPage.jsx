import Footer from "../components/layout/Footer";
import LoginForm from "../components/auth/LoginForm";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation();
    usePageTitle(t('auth.signin'));

    return (
        <div className="socnet-fullscreen-center">
            <div className="socnet-auth-card">
                <div className="socnet-auth-header">
                    <h1 className="socnet-auth-title">{t('auth.signin')}</h1>
                </div>
                <LoginForm />
            </div>
            <Footer />
        </div>
    );
}