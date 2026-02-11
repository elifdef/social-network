import { Link } from "react-router-dom";
import { useDateFormatter } from '../../hooks/useDateFormatter';

export default function PostHeader({ post, isOwner, onEdit, onDelete }) {
    const formatDate = useDateFormatter();
    
    return (
        <div className="vk-post-header">
            <Link to={`/${post.user.username}`}>
                <img
                    src={post.user.avatar}
                    className="vk-post-avatar"
                    alt={post.user.username}
                />
            </Link>

            <div className="vk-post-meta">
                <Link to={`/${post.user.username}`} className="vk-post-author">
                    {post.user.first_name} {post.user.last_name}
                </Link>
                <Link to={`/post/${post.id}`} className="vk-post-date">
                    {formatDate(post.created_at)}
                </Link>
            </div>

            {isOwner && onEdit && onDelete && (
                <div className="vk-post-actions-top">
                    <button className="vk-action-icon" onClick={() => onEdit(post)}>✎</button>
                    <button className="vk-action-icon" onClick={() => onDelete(post.id)}>×</button>
                </div>
            )}
        </div>
    );
}