import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { notifyError } from "../components/common/Notify";
import { useTranslation } from 'react-i18next';
import { useModal } from "../context/ModalContext";

export const useComments = (postId) => {
    const { t } = useTranslation();
    const { openConfirm } = useModal();
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

        api.get(`/posts/${postId}/comments?page=${page}`)
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
                    notifyError(t('error.loading_comments'))
                    setError(true);
                    if (page === 1) notifyError(err);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingInitial(false);
                    setIsLoadingMore(false);
                }
            });

        return () => { isMounted = false; };
    }, [postId, page]);

    useEffect(() => {
        const cleanup = fetchComments();
        return cleanup;
    }, [fetchComments]);

    const loadMore = useCallback(() => {
        if (!isLoadingInitial && !isLoadingMore && hasMore && !error) {
            setPage(p => p + 1);
        }
    }, [isLoadingInitial, isLoadingMore, hasMore, error]);

    const addComment = async (content) => {
        if (!content.trim())
            return false;

        try {
            const res = await api.post(`/posts/${postId}/comments`, { content });
            setComments(prev => [res.data, ...prev]);
            return true;
        } catch (err) {
            notifyError(t('error.add_comment'));
            return false;
        }
    };

    const removeComment = async (commentId) => {
        const isConfirmed = await openConfirm(t('comment.remove_comment'));
        if (!isConfirmed)
            return false;

        try {
            await api.delete(`/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
            return true;
        } catch (err) {
            notifyError(t('error.deleting'));
            return false;
        }
    };

    return {
        comments,
        isLoadingInitial,
        isLoadingMore,
        hasMore,
        error,
        fetchComments,
        loadMore,      
        addComment,
        removeComment
    };
};