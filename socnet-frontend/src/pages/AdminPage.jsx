import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";
import { UsersManager } from '../components/admin/UsersManager';
import AdminDashboard from '../components/admin/AdminDashboard';
import { AdminTabs } from '../components/admin/AdminTabs';

const AdminPage = () => {
    const { t } = useTranslation();
    usePageTitle(t('common.admin_panel'));

    const [activeTab, setActiveTab] = useState('dashboard');

    const adminTabs = [
        { id: 'dashboard', label: t('admin.dashboard') },
        { id: 'users', label: t('admin.users_management') }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'users':
                return <UsersManager canBan={true} />;
            default:
                return null;
        }
    };

    return (
        <div className="socnet-card-wrapper">
            <h2 className="socnet-section-title">{t('common.admin_panel')}</h2>

            <AdminTabs
                tabs={adminTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="admin-content-wrapper">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPage;