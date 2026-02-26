import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from "../hooks/usePageTitle";
import { AdminTabs } from '../components/admin/AdminTabs';
import { PostsManager } from '../components/admin/PostsManager';
import { UsersManager } from '../components/admin/UsersManager';

const ModerationPage = ({ currentUser }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();

    const activeTab = searchParams.get('act') || 'posts';
    usePageTitle(t('common.moderator'));

    const tabs = [
        { id: 'posts', label: t('admin.moderation_posts') },
        { id: 'users', label: t('admin.users_management') }
    ];

    const handleTabChange = (tabId) => setSearchParams({ act: tabId });

    return (
        <div className="socnet-card-wrapper">
            <h2 className="socnet-section-title">{t('common.moderator')}</h2>
            <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

            <div style={{ marginTop: '15px' }}>
                {activeTab === 'posts' && <PostsManager currentUser={currentUser} />}
                {activeTab === 'users' && <UsersManager canBan={true} />}
            </div>
        </div>
    );
};

export default ModerationPage;