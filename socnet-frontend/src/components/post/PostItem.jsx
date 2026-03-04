import { useState, useEffect } from "react";
import { usePostLike } from "../../hooks/usePostLike";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";
import api from "../../api/axios";
import { notifyError, notifySuccess } from "../common/Notify";
import { useTranslation } from 'react-i18next';
import { useModal } from "../../context/ModalContext";

export default function PostItem({
    post,
    onEdit,
    onDelete,
    isOwner,
    onLikeToggle,
    onRepostSuccess,
    isInner = false,
    readonly = false,
    depth = 1
}) {
    const { t } = useTranslation();
    const { openPrompt } = useModal();
    const [postData, setPostData] = useState(post);
    const [isReposting, setIsReposting] = useState(false);

    useEffect(() => {
        setPostData(post);
    }, [post]);

    const { handleLike } = usePostLike(postData);

    const handlePostUpdate = (updates) => {
        if (readonly) return;
        setPostData(prev => ({ ...prev, ...updates }));
    };

    const handleWallLike = async () => {
        if (readonly) return;

        const result = await handleLike();
        if (result) {
            setPostData(prev => ({
                ...prev,
                is_liked: result.liked,
                likes_count: result.likes_count
            }));

            if (onLikeToggle)
                onLikeToggle(postData.id, result.liked);
        }
    };

    const handleRepost = async () => {
        if (readonly) return;

        const content = await openPrompt(
            t('post.add_repost_comment'),
            t('post.repost_placeholder')
        );

        if (content === null) return;

        setIsReposting(true);
        try {
            const targetId = postData.id;

            const response = await api.post('/posts', {
                content: content.trim() !== '' ? content : null,
                original_post_id: targetId
            });

            notifySuccess(t('post.repost_success'));

            if (onRepostSuccess && response.data)
                onRepostSuccess(response.data);

        } catch (err) {
            notifyError(t('error.repost_failed'));
        } finally {
            setIsReposting(false);
        }
    };

    return (
        <div className={`socnet-post ${isInner ? 'socnet-post-inner' : ''} ${readonly ? 'socnet-post-readonly' : ''}`}>
            <PostHeader
                post={postData}
                isOwner={isOwner}
                onEdit={!isInner && !readonly ? onEdit : null}
                onDelete={!isInner && !readonly ? onDelete : null}
            />

            <PostContent
                content={postData.content}
                post={postData}
                onUpdate={handlePostUpdate}
            />

            {postData.original_post_id && (
                <div className="socnet-repost-branch">
                    {postData.original_post && depth < 3 ? (
                        <PostItem
                            post={postData.original_post}
                            isInner={true}
                            readonly={true}
                            depth={depth + 1}
                        />
                    ) : (
                        <div className="socnet-repost-limit-msg">
                            {t('post.nested_too_deep')}
                        </div>
                    )}
                </div>
            )}

            {!isInner && (
                <PostFooter
                    postId={postData.id}
                    isLiked={postData.is_liked}
                    likesCount={postData.likes_count}
                    commentsCount={postData.comments_count}
                    repostsCount={postData.reposts_count}
                    onLike={handleWallLike}
                    onRepost={handleRepost}
                    isReposting={isReposting}
                    readonly={readonly}
                />
            )}
        </div>
    );
}