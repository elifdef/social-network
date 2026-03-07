import { useState, useEffect } from "react";
import { usePostLike } from "../../hooks/usePostLike";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";
import api from "../../api/axios";
import { notifyError, notifySuccess } from "../common/Notify";
import { useTranslation } from 'react-i18next';
import { useModal } from "../../context/ModalContext";
import ReportModal from "../common/ReportModal";

export default function PostItem({
    post,
    onEdit,
    onDelete,
    isOwner,
    currentUserId,
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
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
            t('common.repost'), t('common.comment'), true
        );

        if (content === null) return;

        setIsReposting(true);
        try {
            const targetId = postData.is_repost ? postData.original_post_id : postData.id;

            const response = await api.post('/posts', {
                content: content.trim() !== '' ? content : null,
                original_post_id: targetId
            });

            notifySuccess(t('post.repost_success'));

            setPostData(prev => ({
                ...prev,
                reposts_count: (prev.reposts_count || 0) + 1
            }));

            if (onRepostSuccess && response.data) {
                onRepostSuccess(response.data);
            }

        } catch (err) {
            notifyError(t('common.error'));
        } finally {
            setIsReposting(false);
        }
    };

    return (
        <div className={`socnet-post ${isInner ? 'socnet-post-inner' : ''} ${readonly ? 'socnet-post-readonly' : ''}`}>
            <PostHeader
                post={postData}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onEdit={!isInner && !readonly ? onEdit : null}
                onDelete={!isInner && !readonly ? onDelete : null}
                onReport={!isInner && !readonly ? () => setIsReportModalOpen(true) : null}
            />

            <PostContent
                content={postData.content}
                post={postData}
                onUpdate={handlePostUpdate}
            />

            {postData.is_repost && (
                <div className="socnet-repost-branch">
                    {postData.original_post_id && postData.original_post && depth < 3 ? (
                        <PostItem
                            post={postData.original_post}
                            isInner={true}
                            readonly={true}
                            depth={depth + 1}
                        />
                    ) : postData.original_post_id && depth >= 3 ? (
                        <div className="socnet-repost-limit-msg">
                            {t('post.nested_too_deep')}
                        </div>

                    ) : (
                        <div className="socnet-deleted-stub">
                            {t('post.original_deleted')}
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

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetType="post"
                targetId={postData.id}
            />
        </div>
    );
}