import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer"
import { APP_NAME } from "../config";
import { usePageTitle } from "../hooks/usePageTitle";
import FeatureSection from "../components/landing/FeatureSection"
import { useTranslation } from 'react-i18next';

export default function MainPage() {
    const { t } = useTranslation();
    usePageTitle();
    const features = t('main.blocks', { returnObjects: true });

    return (
        <div className="landing-page-wrapper">
            <header className="landing-header">
                <h1 className="landing-title">
                    {t('main.title', { name: APP_NAME })}
                </h1>
                <p className="landing-subtitle">
                    {t('main.subtitle')}
                </p>
            </header>

            {features.map((feature, index) =>
                <FeatureSection
                    key={index}
                    title={feature.title}
                    description={feature.description}
                    imageAlt={feature.img_alt}
                    isReversed={index % 2 === 0 ? true : false}
                    color={(() => {
                        const r = Math.floor(Math.random() * 256);
                        const g = Math.floor(Math.random() * 256);
                        const b = Math.floor(Math.random() * 256);
                        return `rgb(${r}, ${g}, ${b})`
                    })()}
                />
            )}

            <section className="cta-block">
                <div className="cta-content">
                    <h2>{t('main.join.header')}</h2>
                    <p>{t('main.join.description')}</p>

                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary-large">
                            {t('main.join.signup_btn')}
                        </Link>
                        <Link to="/login" className="btn btn-outline-large">
                            {t('main.join.signin_btn')}
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}