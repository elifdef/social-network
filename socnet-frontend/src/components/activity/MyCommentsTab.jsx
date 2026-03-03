import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import ActivityCommentItem from './ActivityCommentItem';
import InfiniteScrollList from '../common/InfiniteScrollList';
import { notifyError } from '../common/Notify';

export default function MyCommentsTab() {
    const { t } = useTranslation();
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    const fetchComments = useCallback(() => {
        let isMounted = true;

        if (page === 1) setIsLoadingInitial(true);
        else setIsLoadingMore(true);
        setError(false);

        api.get(`/activity/comments?page=${page}`)
            .then(res => {
                if (isMounted) {
                    const newComments = res.data.data;
                    const meta = res.data.meta;

                    setComments(prev => {
                        if (page === 1) return newComments;

                        const uniqueNewComments = newComments.filter(
                            newComment => !prev.some(existing => existing.id === newComment.id)
                        );
                        return [...prev, ...uniqueNewComments];
                    });

                    setHasMore(meta.current_page < meta.last_page);
                }
            })
            .catch(err => {
                if (isMounted) {
                    notifyError(t('common.loading_comments'))
                    console.log(err);
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
    }, [page]);

    useEffect(() => {
        const cleanup = fetchComments();
        return cleanup;
    }, [fetchComments]);

    const loadMore = useCallback(() => {
        if (!isLoadingInitial && !isLoadingMore && hasMore && !error) {
            setPage(p => p + 1);
        }
    }, [isLoadingInitial, isLoadingMore, hasMore, error]);

    return (
        <InfiniteScrollList
            itemsCount={comments.length}
            isLoadingInitial={isLoadingInitial}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            error={error}
            onRetry={fetchComments}
            className="socnet-notification-list"
            emptyState={
                <div className="socnet-empty-state">
                    <p>{t('activity.comments.empty')}</p>
                </div>
            }
            endMessage={t('common.no_more_data')}
        >
            {comments.map(comment => (
                <ActivityCommentItem
                    key={comment.id}
                    comment={comment}
                />
            ))}
        </InfiniteScrollList>
    );
}