import { useTranslation } from 'react-i18next';
import { usePostActions } from "./hooks/usePostActions";

import PostHeader from "./PostHeader";
import PostContent from "./content/PostContent";
import PostFooter from "./PostFooter";
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

    const {
        postData,
        isReposting,
        isReportModalOpen, setIsReportModalOpen,
        updateLocalPost,
        toggleLike,
        createRepost
    } = usePostActions(post, readonly, onLikeToggle, onRepostSuccess);

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
                onUpdate={updateLocalPost}
                isOwner={isOwner}
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
                    onLike={toggleLike}
                    onRepost={createRepost}
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