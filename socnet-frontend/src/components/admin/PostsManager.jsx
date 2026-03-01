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
            t('admin.delete_reason'),
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
    const handleEdit = (postId) => { alert("under construction"); };

    return (
        <div>
            <form onSubmit={handleSearch} className="admin-search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                    <Input
                        label={t('admin.filter_user_posts')}
                        type="text"
                        placeholder={t('admin.username_without_sobaka')}
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
                        <p>{t('admin.posts_not_found_desc')}</p>
                    </div>
                }
            >
                {posts.map(post => (
                    <div key={post.id} className="socnet-post">
                        <div className="socnet-post-header">
                            <Link to={`/${post.user?.username}`}>
                                <img src={post.user?.avatar} alt="author" className="socnet-post-avatar" />
                            </Link>
                            <div className="socnet-post-meta">
                                <Link to={`/${post.user?.username}`} className="socnet-post-author" target="_blank">
                                    {post.user?.first_name} {post.user?.last_name}
                                </Link>
                                <span className="socnet-post-date">
                                    ID: {post.id} • {formatDate(post.created_at)}
                                </span>
                            </div>

                            <div className="socnet-post-actions-top" style={{ opacity: 1 }}>
                                {isAdmin && (
                                    <button className="socnet-action-icon" onClick={() => handleEdit(post.id)} title={t('common.edit')}>✎</button>
                                )}
                                <button className="socnet-post-delete" onClick={() => handleDelete(post.id)} title={t('common.delete')}>✖</button>
                            </div>
                        </div>

                        <PostContent content={post.content} image={post.image} post={post} onUpdate={() => { }} />

                        <div className="admin-footer-wrapper">
                            <PostFooter postId={post.id} isLiked={true} likesCount={post.likes_count || 0} commentsCount={post.comments_count || 0} onLike={() => { }} />
                        </div>
                    </div>
                ))}
            </InfiniteScrollList>
        </div>
    );
};