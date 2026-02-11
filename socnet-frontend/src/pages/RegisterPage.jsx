import Footer from "../components/layout/Footer";
import RegisterForm from "../components/auth/RegisterForm";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const { t } = useTranslation();
    usePageTitle(t('auth.signup'));
    return (
        <>
            <div className="auth-container">
                <h1>{t('auth.signup')}</h1>
                <RegisterForm />
            </div>
            <Footer />
        </>
    );
}