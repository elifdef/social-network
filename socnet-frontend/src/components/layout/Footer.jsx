import { useTranslation } from 'react-i18next';
import { APP_NAME } from "../../config";

export default function Footer() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    };

    const isActive = (lang) => i18n.language.startsWith(lang);

    return (
        <footer className="landing-footer">
            <div className="footer-row">
                <div className="footer-languages">
                    <span
                        className={`lang-link ${isActive('uk') ? 'active' : ''}`}
                        onClick={() => changeLanguage('uk')}
                    >
                        Українська
                    </span>

                    <span className="lang-separator">|</span>
                    <span
                        className={`lang-link ${isActive('en') ? 'active' : ''}`}
                        onClick={() => changeLanguage('en')}
                    >
                        English
                    </span>

                    <span className="lang-separator">|</span>
                    <span className="lang-link all-langs">
                        all languages »
                    </span>
                </div>
            </div>

            <div className="footer-row copyright">
                © 2025 - 2026 {APP_NAME}. {t('footer.text')}
            </div>
        </footer>
    );
}