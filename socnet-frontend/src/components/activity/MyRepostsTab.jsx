import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import PostItem from '../post/PostItem';
import InfiniteScrollList from '../common/InfiniteScrollList';

export default function MyRepostsTab() {
    const { t } = useTranslation();
    const [reposts, setReposts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const fetchReposts = useCallback(() => {
        let isMounted = true;

        if (page === 1) setIsLoadingInitial(true);
        else setIsLoadingMore(true);
        setError(false);

        api.get(`/activity/reposts?page=${page}`)
            .then(res => {
                if (isMounted) {
                    const newReposts = res.data.data;
                    const meta = res.data.meta;

                    setReposts(prev => {
                        if (page === 1) return newReposts;
                        const uniqueNew = newReposts.filter(
                            newItem => !prev.some(existing => existing.id === newItem.id)
                        );
                        return [...prev, ...uniqueNew];
                    });

                    setHasMore(meta.current_page < meta.last_page);
                }
            })
            .catch(err => {
                if (isMounted) setError(true);
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingInitial(false);
                    setIsLoadingMore(false);
                }
            });

        return () => { isMounted = false; };
    }, [page]);

    useEffect(() => {
        const cleanup = fetchReposts();
        return cleanup;
    }, [fetchReposts]);

    const loadMore = useCallback(() => {
        if (!isLoadingInitial && !isLoadingMore && hasMore && !error) {
            setPage(p => p + 1);
        }
    }, [isLoadingInitial, isLoadingMore, hasMore, error]);

    return (
        <InfiniteScrollList
            itemsCount={reposts.length}
            isLoadingInitial={isLoadingInitial}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            error={error}
            onRetry={fetchReposts}
            className="socnet-post-list"
            emptyState={
                <div className="socnet-empty-state">
                    <p>{t('activity.reposts.empty')}</p>
                </div>
            }
        >
            {reposts.map(post => (
                <PostItem
                    key={post.id}
                    post={post}
                    readonly={true}
                />
            ))}
        </InfiniteScrollList>
    );
}