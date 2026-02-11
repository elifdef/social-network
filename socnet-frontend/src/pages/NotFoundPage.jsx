import { Link } from "react-router-dom";
import NotFound from "../assets/notFound.svg?react";
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
    const { t } = useTranslation();
    
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <NotFound width={256} height={256} />
                <h1 className="not-found-title">{t('error.page_not_found')}</h1>
                <p className="not-found-text">
                    {t('page_404.invalid_page')}
                </p>

                <Link to="/" className="not-found-btn">
                    {t('page_404.return_home')}
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;