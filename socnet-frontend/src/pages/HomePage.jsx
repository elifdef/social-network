import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { usePageTitle } from "../hooks/usePageTitle";
import PostItem from "../components/post/PostItem";
import { notifyError } from "../components/common/Notify";
import { useTranslation } from 'react-i18next';
import InfiniteScrollList from "../components/common/InfiniteScrollList";

export default function HomePage() {
    const { t } = useTranslation();
    usePageTitle(t('common.posts'));
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'feed';
    const [error, setError] = useState(false);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const abortControllerRef = useRef(null);

    const handleTabChange = (tab) => {
        if (activeTab === tab) return;

        setLoading(true);
        setPosts([]);
        setError(false);
        setPage(1);
        setHasMore(true);
        setSearchParams({ tab });
    };

    const fetchFeed = async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const newController = new AbortController();
        abortControllerRef.current = newController;

        try {
            setError(false);
            if (page === 1) setLoading(true);
            else setIsLoadingMore(true);

            const endpoint = activeTab === 'global' ? '/feed/global' : '/feed';
            const res = await api.get(`${endpoint}?page=${page}`, { signal: newController.signal });

            const newPosts = res.data.data;
            const meta = res.data.meta;

            setPosts(prev => {
                if (page === 1) return newPosts;
                const uniqueNewPosts = newPosts.filter(
                    newPost => !prev.some(existingPost => existingPost.id === newPost.id)
                );
                return [...prev, ...uniqueNewPosts];
            });

            setHasMore(meta.current_page < meta.last_page);
        } catch (err) {
            if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                setError(true);
                if (page === 1) notifyError(t('error.loading', { resource: "feed" }));
            }
        } finally {
            if (!newController.signal.aborted) {
                setLoading(false);
                setIsLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        fetchFeed();
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        }
    }, [activeTab, page]);

    const loadMore = useCallback(() => {
        if (!loading && !isLoadingMore && hasMore && !error) {
            setPage(prev => prev + 1);
        }
    }, [loading, isLoadingMore, hasMore, error]);

    const EmptyState = () => (
        <div className="socnet-feed-empty">
            <h3>{t('common.welcome')}!</h3>
            {activeTab === 'feed' ? (
                <>
                    <p>{t('feed.my_feed_empty')}</p>
                    <div className="socnet-feed-actions">
                        <Link to="/friends?tab=all" className="socnet-btn-small" style={{ textDecoration: 'none', color: '#fff' }}>
                            {t('feed.find_friends')}
                        </Link>
                        <button className="socnet-btn-small" onClick={() => handleTabChange('global')}>
                            {t('feed.view_global_feed')}
                        </button>
                    </div>
                </>
            ) : (
                <p>{t('feed.global_feed_empty')}</p>
            )}
        </div>
    );

    return (
        <div className="socnet-feed-page">
            <div className="socnet-feed-tabs">
                <button
                    className={`socnet-feed-tab ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => handleTabChange('feed')}>
                    {t('feed.my_feed')}
                </button>
                <button
                    className={`socnet-feed-tab ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => handleTabChange('global')}>
                    {t('feed.global_feed')}
                </button>
            </div>
            <InfiniteScrollList
                itemsCount={posts.length}
                isLoadingInitial={loading && page === 1}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
                error={error}
                onRetry={fetchFeed}
                emptyState={<EmptyState />}
            >
                {posts.map(post => (
                    <PostItem key={post.id} post={post} />
                ))}
            </InfiniteScrollList>
        </div>
    );
}