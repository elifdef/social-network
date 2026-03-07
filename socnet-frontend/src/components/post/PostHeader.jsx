import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import EditIcon from '../../assets/edit.svg?react';
import DeleteIcon from '../../assets/delete.svg?react';
import FlagIcon from '../../assets/flag.svg?react';

export default function PostHeader({ post, isOwner, onEdit, onDelete, onReport, currentUserId }) {
    const { t } = useTranslation();
    const formatDate = useDateFormatter();
    const { username: currentProfileUsername } = useParams();
    const showTargetUser = post.target_user && post.target_user.username !== currentProfileUsername;
    const isAuthor = currentUserId ? currentUserId == post.user?.id : isOwner;

    const canEdit = onEdit && isAuthor;             // редагує ТІЛЬКИ автор
    const canDelete = onDelete && isOwner;          // видаляє автор АБО власник стіни
    const canReport = onReport && !isAuthor;        // скаржиться будь-хто КРІМ автора

    const showActions = canEdit || canDelete || canReport;

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
                <div className="socnet-post-authors-row">
                    <Link to={`/${post.user.username}`} className="socnet-post-author">
                        {post.user.first_name} {post.user.last_name}
                    </Link>

                    {showTargetUser && (
                        <span className="socnet-post-target-text">
                            {' '}{t(`post.wrote_on_wall_${post.user.gender === 2 ? 'female' : 'male'}`)}{' '}
                            <Link to={`/${post.target_user.username}`} className="socnet-post-author target">
                                {post.target_user.first_name} {post.target_user.last_name}
                            </Link>
                        </span>
                    )}
                </div>

                <Link to={`/post/${post.id}`} className="socnet-post-date">
                    {formatDate(post.created_at)}
                </Link>
            </div>

            {showActions && (
                <div className="socnet-post-actions-top">
                    {canReport && (
                        <button className="socnet-action-icon" onClick={() => onReport(post.id)} title={t('reports.title')}>
                            <FlagIcon width={16} height={16} />
                        </button>
                    )}
                    {canEdit && (
                        <button className="socnet-action-icon" onClick={() => onEdit(post)} title={t('common.edit')}>
                            <EditIcon width={16} height={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="socnet-action-icon" onClick={() => onDelete(post.id)} title={t('common.delete')}>
                            <DeleteIcon width={16} height={16} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}