import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import PostItem from '../post/PostItem';
import InfiniteScrollList from '../common/InfiniteScrollList';
import { notifyError } from '../common/Notify';

export default function LikedPostsTab() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const fetchLikedPosts = useCallback(() => {
        let isMounted = true;

        if (page === 1) setIsLoadingInitial(true);
        else setIsLoadingMore(true);
        setError(false);

        api.get(`/activity/liked?page=${page}`)
            .then(res => {
                if (isMounted) {
                    const newPosts = res.data.data;
                    const hasNextPage = res.data.meta ? res.data.meta.current_page < res.data.meta.last_page : !!res.data.next_page_url;

                    setPosts(prev => {
                        if (page === 1) return newPosts;

                        const uniqueNewPosts = newPosts.filter(
                            newPost => !prev.some(existing => existing.id === newPost.id)
                        );
                        return [...prev, ...uniqueNewPosts];
                    });

                    setHasMore(hasNextPage);
                }
            })
            .catch(err => {
                if (isMounted) {
                    notifyError(t('error.loading_likes'));
                    setError(true);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingInitial(false);
                    setIsLoadingMore(false);
                }
            });

        return () => { isMounted = false; };
    }, [page, t]);

    useEffect(() => {
        const cleanup = fetchLikedPosts();
        return cleanup;
    }, [fetchLikedPosts]);

    const loadMore = useCallback(() => {
        if (!isLoadingInitial && !isLoadingMore && hasMore && !error) {
            setPage(p => p + 1);
        }
    }, [isLoadingInitial, isLoadingMore, hasMore, error]);

    const handleLikeToggle = (postId, isLiked) => {
        if (!isLiked) {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };

    return (
        <InfiniteScrollList
            itemsCount={posts.length}
            isLoadingInitial={isLoadingInitial}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            error={error}
            onRetry={fetchLikedPosts}
            className="socnet-feed-list"
            emptyState={
                <div className="socnet-empty-state">
                    <p>{t('activity.likes.empty')}</p>
                </div>
            }
            endMessage={t('common.no_more_data')}
        >
            {posts.map(post => (
                <PostItem
                    key={post.id}
                    post={post}
                    onLikeToggle={handleLikeToggle}
                />
            ))}
        </InfiniteScrollList>
    );
}