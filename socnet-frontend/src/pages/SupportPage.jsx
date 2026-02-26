import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";

const SupportPage = () => {
    const { t } = useTranslation();
    usePageTitle(t('common.support', 'Підтримка'));

    return (
        <div className="socnet-card-wrapper">
            <h2 className="socnet-section-title">{t('common.support', 'Підтримка')}</h2>
            <div className="socnet-feed-empty">
                Підтримка (У розробці)
                <div>
                    Підтримайте себе самі
                </div>
            </div>
        </div>
    );
};

export default SupportPage;