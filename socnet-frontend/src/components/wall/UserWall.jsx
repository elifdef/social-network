import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { useUserWall } from '../../hooks/useUserWall';
import WallHeader from './WallHeader';
import CreatePostForm from './CreatePostForm';
import WallPostList from './WallPostList';
import InfiniteScrollList from '../common/InfiniteScrollList';

export default function UserWall({ profileUser, isOwnProfile }) {
    const { user: authUser } = useContext(AuthContext);
    const wallData = useUserWall(profileUser);
    const { t } = useTranslation();

    return (
        <div className="socnet-wall">
            <WallHeader postsCount={wallData.countPosts} />

            {isOwnProfile && (<CreatePostForm onSubmitSuccess={wallData.createPost} />)}

            <InfiniteScrollList
                className=""
                itemsCount={wallData.posts.length}
                isLoadingInitial={wallData.isPageLoading}
                isLoadingMore={wallData.isLoadingMore}
                hasMore={wallData.hasMore}
                onLoadMore={wallData.loadMore}
                emptyState={
                    <div className="socnet-empty-state with-card" style={{ marginTop: '15px' }}>
                        {t('wall.no_posts_yet')}
                    </div>
                }
            >
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
            </InfiniteScrollList>
        </div>
    );
}