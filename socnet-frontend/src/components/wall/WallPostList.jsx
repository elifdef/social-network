import PostItem from '../post/PostItem';
import EditPostForm from './EditPostForm';

export default function WallPostList({
    posts, authUser,
    editingPostId,
    editContent, setEditContent,
    existingMedia, newEditPreviews,
    removeExistingMedia, removeNewEditImage,
    handleEditFileSelect, handlePaste,
    saveEdit, cancelEditing,
    startEditing, handleDelete, handleRepostSuccess
}) {
    return (
        <div className="socnet-post-list">
            {posts.map(post => (
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
                            isOwner={authUser && authUser.id === post.user.id}
                            onEdit={startEditing}
                            onDelete={handleDelete}
                            onRepostSuccess={handleRepostSuccess}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}