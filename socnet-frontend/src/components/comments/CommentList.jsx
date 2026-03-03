import CommentItem from "./CommentItem";

export default function CommentList({ loading, comments, currentUser, onDelete, loadingText, noCommentsText }) {

    if (loading)
        return <div className="loading-text">{loadingText}</div>;

    if (comments.length === 0)
        return <div className="no-comments">{noCommentsText}</div>;

    return (
        <div className="socnet-comments-list">
            {comments.map(comment => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUser={currentUser}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}