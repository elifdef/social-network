import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { notifyError } from "../components/Notify";
import { useTranslation } from 'react-i18next';

export const usePostLike = (post) => {
    const { user } = useContext(AuthContext);
    const { t } = useTranslation();
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (!post || isLiking)
            return null;

        setIsLiking(true);

        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!previousLiked);
        setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

        try {
            const res = await api.post(`/posts/${post.id}/like`);
            setLikesCount(res.data.likes_count);
            setIsLiked(res.data.liked);
            return {
                liked: res.data.liked,
                likes_count: res.data.likes_count
            };

        } catch (error) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            notifyError(t('error.connection'));
            return null;
        } finally {
            setIsLiking(false);
        }
    };

    return { isLiked, likesCount, handleLike };
};