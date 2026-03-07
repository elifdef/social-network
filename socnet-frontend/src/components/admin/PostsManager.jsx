import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import adminAPI from '../../api/admin.api';
import { notifySuccess, notifyError } from "../common/Notify";
import { useModal } from '../../context/ModalContext';
import api from '../../api/axios';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import Button from '../UI/Button';
import Input from '../UI/Input';
import PostContent from '../post/PostContent';
import PostFooter from '../post/PostFooter';
import PostItem from '../post/PostItem';
import InfiniteScrollList from '../common/InfiniteScrollList';
import { userRole } from '../../config';

export const PostsManager = ({ currentUser }) => {
    const [posts, setPosts] = useState([]);
    const [targetUser, setTargetUser] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { openPrompt } = useModal();
    const { t } = useTranslation();
    const formatDate = useDateFormatter();
    const isAdmin = currentUser.role === userRole.Admin;

    const fetchPosts = async (username = '', pageNum = 1, append = false) => {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);

        try {
            const response = await adminAPI.getPosts(username, pageNum);
            const newPosts = response.data || [];

            if (append) setPosts(prev => [...prev, ...newPosts]);
            else setPosts(newPosts);

            setHasMore(newPosts.length === (response.meta?.per_page || 20));
        } catch (error) {
            notifyError(t('common.error'))
            console.error('Error', error);
        } finally {
            if (append) setIsLoadingMore(false);
            else setIsLoading(false);
        }
    };

    useEffect(() => { fetchPosts('', 1, false); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPosts(targetUser, 1, false);
    };

    const loadMore = () => {
        if (!isLoadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(targetUser, nextPage, true);
        }
    };

    const handleDelete = async (postId) => {
        const reason = await openPrompt(
            t('admin.posts.delete_reason'),
            "",
            t('common.delete'),
            t('common.cancel')
        );

        if (reason === null) return;

        try {
            await api.delete(`/posts/${postId}`, { data: { reason: reason } });
            setPosts(posts.filter(post => post.id !== postId));
            notifySuccess(t('common.deleted'));
        } catch (error) {
            notifyError(error.response?.data?.message || t('error.deleting'));
        }
    };

    const handleEdit = (postId) => {
        alert(t('admin.common.under_construction'));
    };

    return (
        <>
            <form onSubmit={handleSearch} className="admin-search-bar admin-post-search">
                <div className="admin-post-search-input">
                    <Input
                        label={t('admin.posts.filter_label')}
                        type="text"
                        placeholder={t('admin.posts.filter_placeholder')}
                        value={targetUser}
                        onChange={(e) => setTargetUser(e.target.value)}
                    />
                </div>
                <Button type="submit">{t('common.find')}</Button>
            </form>

            <InfiniteScrollList
                className="socnet-feed-list admin-feed-wrapper"
                itemsCount={posts.length}
                isLoadingInitial={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
                emptyState={
                    <div className="socnet-empty-state with-card">
                        <h3>{t('post.posts_not_found')}</h3>
                        <p>{t('admin.posts.not_found_desc')}</p>
                    </div>
                }
            >
                {posts.map(post => {
                    // Перевіряємо, чи написаний пост на чужій стіні
                    const showTargetUser = post.target_user && post.target_user.username !== post.user?.username;

                    return (
                        <div key={post.id} className="socnet-post">
                            <div className="socnet-post-header">
                                <Link to={`/${post.user?.username}`} target="_blank">
                                    <img src={post.user?.avatar} alt="author" className="socnet-post-avatar" />
                                </Link>
                                <div className="socnet-post-meta">
                                    <div className="socnet-post-authors-row">
                                        <Link to={`/${post.user?.username}`} className="socnet-post-author" target="_blank">
                                            {post.user?.first_name} {post.user?.last_name}
                                        </Link>

                                        {showTargetUser && (
                                            <span className="socnet-post-target-text">
                                                {' '}{t(`post.wrote_on_wall_${post.user?.gender === 2 ? 'female' : 'male'}`)}{' '}
                                                <Link to={`/${post.target_user.username}`} className="socnet-post-author target" target="_blank">
                                                    {post.target_user.first_name} {post.target_user.last_name}
                                                </Link>
                                            </span>
                                        )}
                                    </div>
                                    <span className="socnet-post-date">
                                        ID: {post.id} • {formatDate(post.created_at)}
                                    </span>
                                </div>

                                <div className="socnet-post-actions-top admin-post-actions-visible">
                                    {isAdmin && (
                                        <button
                                            className="socnet-action-icon"
                                            onClick={() => handleEdit(post.id)}
                                            title={t('common.edit')}
                                        >
                                            ✎
                                        </button>
                                    )}
                                    <button
                                        className="socnet-post-delete"
                                        onClick={() => handleDelete(post.id)}
                                        title={t('common.delete')}
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>

                            <PostContent content={post.content} post={post} onUpdate={() => { }} />

                            {post.is_repost && (
                                <div className="socnet-repost-branch">
                                    {post.original_post_id && post.original_post ? (
                                        <PostItem
                                            post={post.original_post}
                                            isInner={true}
                                            readonly={true}
                                        />
                                    ) : (
                                        <div className="socnet-deleted-stub">
                                            {t('post.original_deleted')}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="admin-footer-wrapper">
                                <PostFooter
                                    postId={post.id}
                                    isLiked={false}
                                    likesCount={post.likes_count || 0}
                                    commentsCount={post.comments_count || 0}
                                    repostsCount={post.reposts_count || 0}
                                    readonly={true}
                                />
                            </div>
                        </div>
                    );
                })}
            </InfiniteScrollList>
        </>
    );
};