import PostItem from '../post/PostItem';
import EditPostForm from './EditPostForm';

export default function WallPostList({
    posts, authUser, profileUser,
    editingPostId,
    editContent, setEditContent,
    existingMedia, newEditPreviews,
    removeExistingMedia, removeNewEditImage,
    handleEditFileSelect, handlePaste,
    saveEdit, cancelEditing,
    startEditing, handleDelete, handleRepostSuccess
}) {
    const isWallOwner = authUser && profileUser && authUser.id === profileUser.id;

    return (
        <div className="socnet-post-list">
            {posts.map(post => {
                const isAuthor = authUser && post.user && authUser.id === post.user.id;

                return (
                    <div key={post.id}>
                        {editingPostId === post.id ? (
                            <EditPostForm
                                post={post}
                                editContent={editContent}
                                setEditContent={setEditContent}
                                existingMedia={existingMedia}
                                newEditPreviews={newEditPreviews}
                                removeExistingMedia={removeExistingMedia}
                                removeNewEditImage={removeNewEditImage}
                                handleEditFileSelect={handleEditFileSelect}
                                handlePaste={handlePaste}
                                saveEdit={saveEdit}
                                cancelEditing={cancelEditing}
                            />
                        ) : (
                            <PostItem
                                post={post}
                                isOwner={isAuthor || isWallOwner} // видалити може автор або власник стіни
                                onEdit={isAuthor ? startEditing : null} // редагувати - ТІЛЬКИ автор
                                onDelete={handleDelete}
                                onRepostSuccess={handleRepostSuccess}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}