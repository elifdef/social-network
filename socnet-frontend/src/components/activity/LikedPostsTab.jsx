import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import PostItem from '../post/PostItem';

export default function LikedPostsTab() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLikedPosts();
    }, [page]);

    const fetchLikedPosts = () => {
        setLoading(true);
        api.get(`/activity/liked?page=${page}`)
            .then(res => {
                const newPosts = res.data.data;

                if (page === 1)
                    setPosts(newPosts);
                else
                    setPosts(prev => [...prev, ...newPosts]);

                setHasMore(!!res.data.next_page_url);
            })
            .catch(err => console.error("Помилка завантаження лайків:", err))
            .finally(() => setLoading(false));
    };

    const handleLikeToggle = (postId, isLiked) => {
        if (!isLiked)
            setPosts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <div>
            {posts.length === 0 && !loading ? (
                <div className="socnet-empty-state">
                    <p>{t('activity.likes.empty')}</p>
                </div>
            ) : (
                <div className="socnet-feed-list">
                    {posts.map(post => (
                        <PostItem
                            key={post.id}
                            post={post}
                            onLikeToggle={handleLikeToggle}
                        />
                    ))}
                </div>
            )}

            {hasMore && posts.length > 0 && (
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