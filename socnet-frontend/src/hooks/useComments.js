import { useState, useEffect } from "react";
import api from "../api/axios";
import { notifyError } from "../components/common/Notify";
import { useTranslation } from 'react-i18next';
import { useModal } from "../context/ModalContext";

export const useComments = (postId) => {
    const { t } = useTranslation();
    const { openConfirm } = useModal();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        api.get(`/posts/${postId}/comments`)
            .then(res => {
                if (isMounted) {
                    const comments = res.data.data;
                    setComments(comments);
                }
            })
            .catch(err => notifyError(err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [postId]);

    const addComment = async (e) => {
        e.preventDefault();
        if (!text.trim())
            return false;

        try {
            const res = await api.post(`/posts/${postId}/comments`, { content: text });
            setComments(prev => [res.data, ...prev]);
            setText("");
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

    return { comments, text, setText, loading, addComment, removeComment };
};