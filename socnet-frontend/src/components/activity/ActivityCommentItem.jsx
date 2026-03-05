import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import DeleteIcon from '../../assets/delete.svg?react';

export default function ActivityCommentItem({ comment, onDelete }) {
    const { t } = useTranslation();
    const formatDate = useDateFormatter();

    const postAuthor = comment.post?.user;
    const me = comment.user;

    return (
        <div className="socnet-activity-card socnet-relative-card">
            {onDelete && (
                <div className="socnet-absolute-actions">
                    <button
                        className="socnet-action-icon"
                        onClick={onDelete}
                        title={t('common.delete')}
                    >
                        <DeleteIcon width={16} height={16} />
                    </button>
                </div>
            )}

            {postAuthor && (
                <div className="socnet-activity-op">
                    <Link to={`/${postAuthor.username}`}>
                        <img
                            src={postAuthor.avatar}
                            alt={postAuthor.username}
                            className="socnet-activity-op-avatar"
                        />
                    </Link>
                    <span>
                        {t('activity.comments.you_commented_on')}{' '}
                        <Link to={`/post/${comment.post_id}`} className="socnet-link">
                            {t('common.post')}
                        </Link>{' '}
                        {t('activity.comments.of_user')}{' '}
                        <Link to={`/${postAuthor.username}`} className="socnet-link socnet-activity-op-name">
                            {postAuthor.first_name} {postAuthor.last_name}
                        </Link>
                    </span>
                </div>
            )}

            <div className="socnet-activity-reply">
                {me && (
                    <img
                        src={me.avatar}
                        alt="my avatar"
                        className="socnet-activity-reply-avatar"
                    />
                )}

                <div className="socnet-activity-bubble-wrapper">
                    <div className="socnet-activity-bubble">
                        {comment.content}
                    </div>

                    <div className="socnet-activity-meta">
                        <span className="socnet-notification-date socnet-activity-date">
                            {formatDate(comment.created_at)}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}