import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";
import { UsersManager } from '../components/admin/UsersManager';

export const AdminPage = () => {
    const { t } = useTranslation();
    usePageTitle(t('common.admin_panel'));

    return (
        <div className="socnet-card-wrapper">
            <h2 className="socnet-section-title">{t('common.admin_panel')}</h2>

            <p style={{ marginBottom: '15px', color: 'var(--text-secondary, #666)' }}>
                {t('admin.admin_page_desc')}
            </p>

            <UsersManager canBan={true} />
        </div>
    );
};