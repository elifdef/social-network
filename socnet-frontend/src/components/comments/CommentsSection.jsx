import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useComments } from "../../hooks/useComments";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { useTranslation } from 'react-i18next';

export default function CommentsSection({ postId, onCountChange }) {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { comments, loading, addComment, removeComment } = useComments(postId);

    const handleAddComment = async (content) => {
        const success = await addComment(content);
        if (success)
            onCountChange(1);
        return success;
    };

    const handleRemoveComment = async (commentId) => {
        const success = await removeComment(commentId);
        if (success) {
            onCountChange(-1);
        }
    };

    return (
        <div className="socnet-comments-container">
            <CommentForm
                user={user}
                onSubmit={handleAddComment}
                placeholder={t('comment.create_comment')}
            />

            <CommentList
                loading={loading}
                comments={comments}
                currentUser={user}
                onDelete={handleRemoveComment}
                loadingText={t('common.loading')}
                noCommentsText={t('comment.no_comments')}
            />
        </div>
    );
}