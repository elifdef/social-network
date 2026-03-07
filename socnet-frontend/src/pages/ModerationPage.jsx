import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";
import { AdminTabs } from '../components/admin/AdminTabs';
import { PostsManager } from '../components/admin/PostsManager';
import { UsersManager } from '../components/admin/UsersManager';
import AdminReports from '../components/admin/AdminReports';

const ModerationPage = ({ currentUser }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();

    const activeTab = searchParams.get('act') || 'posts';
    usePageTitle(t('common.moderator_panel'));

    const tabs = [
        { id: 'reports', label: t('admin.reports.tab') },
        { id: 'posts', label: t('common.posts') },
        { id: 'users', label: t('admin.users_management') }
    ];

    const handleTabChange = (tabId) => { setSearchParams({ act: tabId }); usePageTitle(tabs[tabId]); }

    return (
        <div className="socnet-card-wrapper">
            <h2 className="socnet-section-title">{t('common.moderator_panel')}</h2>
            <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

            <div>
                {activeTab === 'posts' && <PostsManager currentUser={currentUser} />}
                {activeTab === 'users' && <UsersManager canBan={true} />}
                {activeTab === 'reports' && <AdminReports/>}
            </div>
        </div>
    );
};

export default ModerationPage;