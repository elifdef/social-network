import { Link } from "react-router-dom";
import { useDateFormatter } from '../../hooks/useDateFormatter';

export default function CommentItem({ comment, currentUser, onDelete }) {
    const isOwner = currentUser && currentUser.id === comment.user.id;
    const formatDate = useDateFormatter();

    return (
        <div className="vk-comment-item">
            <Link to={`/${comment.user.username}`} className="vk-comment-img-link">
                <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className="vk-comment-avatar"
                />
            </Link>

            <div className="vk-comment-content">
                <div className="vk-comment-header">
                    <Link to={`/${comment.user.username}`} className="vk-comment-author">
                        {comment.user.first_name} {comment.user.last_name}
                    </Link>

                    <span className="vk-comment-date">
                        {formatDate(comment.created_at)}
                    </span>
                </div>

                <div className="vk-comment-text">
                    {comment.content}
                </div>
            </div>

            {isOwner && (
                <button
                    className="vk-comment-delete"
                    onClick={() => onDelete(comment.id)}
                >
                    ✕
                </button>
            )}
        </div>
    );
}