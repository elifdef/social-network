import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import ActivityCommentItem from './ActivityCommentItem';

export default function MyCommentsTab() {
    const { t } = useTranslation();
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [page]);

    const fetchComments = () => {
        setLoading(true);
        api.get(`/activity/comments?page=${page}`)
            .then(res => {
                const newComments = res.data.data;

                if (page === 1)
                    setComments(newComments);
                else
                    setComments(prev => [...prev, ...newComments]);

                setHasMore(!!res.data.next_page_url);
            })
            .catch(err => console.error("Помилка завантаження коментарів:", err))
            .finally(() => setLoading(false));
    };

    return (
        <div>
            {comments.length === 0 && !loading ? (
                <div className="socnet-empty-state">
                    <p>{t('activity.comments.empty')}</p>
                </div>
            ) : (
                <div className="socnet-notification-list">
                    {comments.map(comment => (
                        <ActivityCommentItem
                            key={comment.id}
                            comment={comment}
                        />
                    ))}
                </div>
            )}

            {hasMore && comments.length > 0 && (
                <button
                    className="socnet-btn socnet-btn-block socnet-load-more-btn"
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                >
                    {loading ? t('common.loading') : t('common.load_more')}
                </button>
            )}
        </div>
    );
}