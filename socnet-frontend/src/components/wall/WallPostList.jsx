import PostItem from '../post/PostItem';
import EditPostForm from './EditPostForm';
import { mapPost } from '../../services/mappers';
import i18n from "../../i18n";

export default function WallPostList({
    posts, authUser,
    editingPostId,
    editContent, setEditContent,
    editPreview, removeEditImage,
    handleEditFileSelect, handlePaste,
    saveEdit, cancelEditing,
    startEditing, handleDelete
}) {
    if (posts.length === 0)
        return <div className="vk-wall-empty">{i18n.t('wall.empty_wall')}</div>

    return (
        <div className="vk-post-list">
            {posts.map(post => (
                <div key={post.id}>
                    {editingPostId === post.id ? (
                        <EditPostForm
                            post={post}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            editPreview={editPreview}
                            removeEditImage={removeEditImage}
                            handleEditFileSelect={handleEditFileSelect}
                            handlePaste={handlePaste}
                            saveEdit={saveEdit}
                            cancelEditing={cancelEditing}
                        />
                    ) : (
                        <PostItem
                            post={mapPost(post)}
                            isOwner={authUser && authUser.id === post.user.id}
                            onEdit={startEditing}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}