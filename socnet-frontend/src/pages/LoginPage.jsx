import Footer from "../components/layout/Footer";
import LoginForm from "../components/auth/LoginForm";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation();
    usePageTitle(t('auth.signin'));
    return (
        <>
            <div className="auth-container">
                <h1>{t('auth.signin')}</h1>
                <LoginForm />
            </div>
            <Footer />
        </>
    );
}