import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from "../api/axios"
import LikedPostsTab from '../components/activity/LikedPostsTab';
import MyCommentsTab from '../components/activity/MyCommentsTab';
import MyRepostsTab from '../components/activity/MyRepostsTab';
import { usePageTitle } from '../hooks/usePageTitle';

export default function ActivityPage() {
    const { t } = useTranslation();
    const { tab } = useParams();
    const [counts, setCounts] = useState({ likes: 0, comments: 0, reposts: 0 });

    const getPageTitle = () => {
        const baseTitle = t('common.my_activity');
        switch (tab) {
            case 'likes': return `${baseTitle} | ${t('common.likes')}`;
            case 'comments': return `${baseTitle} | ${t('common.comments')}`;
            case 'reposts': return `${baseTitle} | ${t('common.reposts')}`;
            default: return baseTitle;
        }
    };

    usePageTitle(getPageTitle());

    useEffect(() => {
        api.get('/activity/counts')
            .then(res => setCounts(res.data))
            .catch(err => console.error("Помилка завантаження лічильників", err));
    }, []);

    const updateCount = useCallback((type, delta) => {
        setCounts(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + delta)
        }));
    }, []);

    if (!tab) return <Navigate to="/activity/likes" replace />;

    const renderContent = () => {
        switch (tab) {
            case 'likes':
                return <LikedPostsTab onCountUpdate={(delta) => updateCount('likes', delta)} />;
            case 'comments':
                return <MyCommentsTab onCountUpdate={(delta) => updateCount('comments', delta)} />;
            case 'reposts':
                return <MyRepostsTab onCountUpdate={(delta) => updateCount('reposts', delta)} />;
            default:
                return <div className="socnet-empty-state">{t('error.page_not_found')}</div>;
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
                    {t('common.likes')}
                    <span className="socnet-tab-count">({counts.likes})</span>
                </Link>

                <Link
                    to="/activity/comments"
                    className={`socnet-tab ${tab === 'comments' ? 'active' : ''}`}
                >
                    {t('common.comments')}
                    <span className="socnet-tab-count">({counts.comments})</span>
                </Link>

                <Link
                    to="/activity/reposts"
                    className={`socnet-tab ${tab === 'reposts' ? 'active' : ''}`}
                >
                    {t('common.reposts')}
                    <span className="socnet-tab-count">({counts.reposts})</span>
                </Link>
            </div>

            <div className="socnet-activity-content">
                {renderContent()}
            </div>
        </div>
    );
}