import { Link } from "react-router-dom";
import CommentIcon from "../../assets/comment.svg?react";
import NoCommentIcon from "../../assets/nocomment.svg?react";
import LikeIcon from "../../assets/like.svg?react";
import NoLikeIcon from "../../assets/nolike.svg?react";

export default function PostFooter({ postId, isLiked, likesCount, commentsCount, onLike, style }) {

    const Comment = () => {
        const IconComponent = commentsCount > 0 ? CommentIcon : NoCommentIcon;
        return (
            <Link to={`/post/${postId}`} className="vk-comment-btn">
                <IconComponent width={16} height={16} />
                {commentsCount}
            </Link>
        );
    }

    const Like = () => {
        const IconComponent = isLiked > 0 ? LikeIcon : NoLikeIcon;
        return (
            <button
                className={`vk-like-btn ${isLiked ? 'liked' : ''}`}
                onClick={onLike}>
                <IconComponent width={16} height={16} />
                {likesCount}
            </button>
        );
    }

    return (
        <div className="vk-post-footer" style={style}>
            <Like />
            <Comment />
        </div>
    );
}