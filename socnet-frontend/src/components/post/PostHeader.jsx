import { Link } from "react-router-dom";
import { useDateFormatter } from '../../hooks/useDateFormatter';
import EditIcon from '../../assets/edit.svg?react';
import DeleteIcon from '../../assets/delete.svg?react';

export default function PostHeader({ post, isOwner, onEdit, onDelete }) {
    const formatDate = useDateFormatter();

    return (
        <div className="socnet-post-header">
            <Link to={`/${post.user.username}`}>
                <img
                    src={post.user.avatar}
                    className="socnet-post-avatar"
                    alt={post.user.username}
                />
            </Link>

            <div className="socnet-post-meta">
                <Link to={`/${post.user.username}`} className="socnet-post-author">
                    {post.user.first_name} {post.user.last_name}
                </Link>
                <Link to={`/post/${post.id}`} className="socnet-post-date">
                    {formatDate(post.created_at)}
                </Link>
            </div>

            {isOwner && onEdit && onDelete && (
                <div className="socnet-post-actions-top">
                    <button 
                        className="socnet-action-icon" 
                        onClick={() => onEdit(post)}
                    >
                        <EditIcon width={16} height={16} />
                    </button>
                    
                    <button 
                        className="socnet-action-icon" 
                        onClick={() => onDelete(post.id)}
                    >
                        <DeleteIcon width={16} height={16} />
                    </button>
                </div>
            )}
        </div>
    );
}