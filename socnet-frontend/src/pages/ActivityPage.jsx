import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import LikedPostsTab from '../components/activity/LikedPostsTab';
import MyCommentsTab from '../components/activity/MyCommentsTab';
import MyRepostsTab from '../components/activity/MyRepostsTab';

export default function ActivityPage() {
    const { t } = useTranslation();
    const { tab } = useParams();

    const getPageTitle = () => {
        const baseTitle = t('common.my_activity');
        switch (tab) {
            case 'likes': return `${baseTitle} | ${t('activity.tabs.likes')}`;
            case 'comments': return `${baseTitle} | ${t('activity.tabs.comments')}`;
            case 'reposts': return `${baseTitle} | ${t('activity.tabs.reposts')}`;
            default: return baseTitle;
        }
    };

    usePageTitle(getPageTitle());
    if (!tab) return <Navigate to="/activity/likes" replace />;

    const renderContent = () => {
        switch (tab) {
            case 'likes': return <LikedPostsTab />;
            case 'comments': return <MyCommentsTab />;
            case 'reposts': return <MyRepostsTab />;;
            default: return <div>Розділ не знайдено</div>;
        }
    };

    return (
        <div className="socnet-card-wrapper">
            <h1 className="socnet-section-title">
                {t('common.my_activity')}
            </h1>

            <div className="socnet-tabs">
                <Link
                    to="/activity/likes"
                    className={`socnet-tab ${tab === 'likes' ? 'active' : ''}`}
                >
                    {t('activity.tabs.likes')}
                </Link>

                <Link
                    to="/activity/comments"
                    className={`socnet-tab ${tab === 'comments' ? 'active' : ''}`}
                >
                    {t('activity.tabs.comments')}
                </Link>

                <Link
                    to="/activity/reposts"
                    className={`socnet-tab ${tab === 'reposts' ? 'active' : ''}`}
                >
                    {t('activity.tabs.reposts')}
                </Link>
            </div>

            <div className="socnet-activity-content">
                {renderContent()}
            </div>
        </div>
    );
}