import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useUserWall } from '../../hooks/useUserWall';
import WallHeader from './WallHeader';
import CreatePostForm from './CreatePostForm';
import WallPostList from './WallPostList';

export default function UserWall({ profileUser, isOwnProfile }) {
    const { user: authUser } = useContext(AuthContext);
    const wallData = useUserWall(profileUser);

    return (
        <div className="vk-wall">
            <WallHeader
                postsCount={wallData.posts.length}
            />

            {isOwnProfile && (
                <CreatePostForm
                    content={wallData.content}
                    setContent={wallData.setContent}
                    preview={wallData.preview}
                    removeImage={wallData.removeImage}
                    isDragging={wallData.isDragging}
                    handleDragOver={wallData.handleDragOver}
                    handleDragLeave={wallData.handleDragLeave}
                    handleDrop={wallData.handleDrop}
                    handleFileSelect={wallData.handleFileSelect}
                    handlePaste={wallData.handlePaste}
                    handleSubmit={wallData.handleSubmit}
                />
            )}

            <WallPostList
                posts={wallData.posts}
                authUser={authUser}
                editingPostId={wallData.editingPostId}
                editContent={wallData.editContent}
                setEditContent={wallData.setEditContent}
                editPreview={wallData.editPreview}
                removeEditImage={wallData.removeEditImage}
                handleEditFileSelect={wallData.handleEditFileSelect}
                handlePaste={wallData.handlePaste}
                saveEdit={wallData.saveEdit}
                cancelEditing={wallData.cancelEditing}
                startEditing={wallData.startEditing}
                handleDelete={wallData.handleDelete}
            />
        </div>
    );
}