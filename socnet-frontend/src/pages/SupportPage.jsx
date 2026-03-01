import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";

const SupportPage = () => {
    const { t } = useTranslation();
    usePageTitle(t('common.support_panel'));

    return (
        <div className="socnet-card-wrapper">
            <h2 className="socnet-section-title">{t('common.support_panel')}</h2>
            <div className="socnet-empty-state with-card">
                (У розробці)
                <div>
                    Підтримайте себе самі
                </div>
            </div>
        </div>
    );
};

export default SupportPage;