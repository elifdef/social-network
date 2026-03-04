import { Link } from "react-router-dom";
import CommentIcon from "../../assets/comment.svg?react";
import NoCommentIcon from "../../assets/nocomment.svg?react";
import LikeIcon from "../../assets/like.svg?react";
import NoLikeIcon from "../../assets/nolike.svg?react";
import NoRepostIcon from "../../assets/norepost.svg?react";
import RepostIcon from "../../assets/repost.svg?react";

export default function PostFooter({
    postId,
    isLiked,
    likesCount,
    commentsCount,
    repostsCount = 0,
    onLike,
    onRepost,
    isReposting,
    className,
    readonly = false
}) {

    const Comment = () => {
        const IconComponent = commentsCount > 0 ? CommentIcon : NoCommentIcon;

        if (readonly) {
            return (
                <div className="socnet-comment-btn readonly" style={{ cursor: 'default', opacity: 0.7 }}>
                    <IconComponent width={16} height={16} />
                    {commentsCount}
                </div>
            );
        }

        return (
            <Link to={`/post/${postId}`} className="socnet-comment-btn">
                <IconComponent width={16} height={16} />
                {commentsCount}
            </Link>
        );
    }

    const Like = () => {
        const IconComponent = likesCount > 0 || isLiked ? LikeIcon : NoLikeIcon;

        if (readonly) {
            return (
                <div className={`socnet-like-btn readonly ${isLiked ? 'liked' : ''}`} style={{ cursor: 'default', opacity: 0.7 }}>
                    <IconComponent width={16} height={16} />
                    {likesCount}
                </div>
            );
        }

        return (
            <button
                className={`socnet-like-btn ${isLiked ? 'liked' : ''}`}
                onClick={onLike}>
                <IconComponent width={16} height={16} />
                {likesCount}
            </button>
        );
    }

    const Repost = () => {
        const IconComponent = repostsCount > 0 ? RepostIcon : NoRepostIcon;

        if (readonly)
            return (
                <div className="socnet-repost-btn readonly" style={{ cursor: 'default', opacity: 0.7 }}>
                    <IconComponent width={16} height={16} />
                    {repostsCount}
                </div>
            );

        return (
            <button
                className="socnet-repost-btn"
                onClick={onRepost}
                disabled={isReposting}
            >
                <IconComponent width={16} height={16} />
                {repostsCount}
                {isReposting && '...'}
            </button>
        );
    }

    return (
        <div className={`socnet-post-footer ${className || ''}`}>
            <div className="socnet-post-footer-actions">
                <Like />
                <Comment />
                {(onRepost || readonly) && <Repost />}
            </div>
        </div>
    );
}