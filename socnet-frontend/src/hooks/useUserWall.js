import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyError } from "../components/common/Notify";
import { useModal } from "../context/ModalContext";
import { validateImageFile } from "../services/upload";
import PostService from '../services/post.service';

export const useUserWall = (profileUser) => {
    const { t } = useTranslation();
    const { openConfirm } = useModal();
    const [posts, setPosts] = useState([]);
    const [countPosts, setCountPosts] = useState(0);
    const [isPageLoading, setIsPageLoading] = useState(true);

    // для редагування
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [deleteExistingImage, setDeleteExistingImage] = useState(false);

    // для пагінації
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Завантаження постів
    const fetchPosts = async (pageNumber = 1) => {
        if (!profileUser?.username) return;

        if (pageNumber > 1) {
            setIsLoadingMore(true);
        } else {
            setIsPageLoading(true);
        }

        try {
            const res = await PostService.getUserPosts(profileUser.username, pageNumber);
            const processedPosts = res.data;

            if (pageNumber === 1)
                setPosts(processedPosts);
            else
                setPosts(prev => {
                    const uniqueNewPosts = processedPosts.filter(
                        newPost => !prev.some(existingPost => existingPost.id === newPost.id)
                    );
                    return [...prev, ...uniqueNewPosts];
                });

            const meta = res.meta;
            setCountPosts(res.meta.total);
            setHasMore(meta.current_page < meta.last_page);
        } catch (err) {
            if (err.response && err.response.status === 403)
                setPosts([]);
            else
                notifyError(t('error.loading_post'));
        } finally {
            if (pageNumber === 1) setIsPageLoading(false);
            else setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setPosts([]);
        setIsPageLoading(true);
        fetchPosts(1);
    }, [profileUser?.username]);

    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    }, [isLoadingMore, hasMore, page, profileUser?.username]);

    const createPost = async (content, image) => {
        try {
            const newPost = await PostService.create({ image, content });
            setPosts([newPost, ...posts]);
            setCountPosts(countPosts + 1);
            return true;
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
            return false;
        }
    };

    const setEditFileState = (file) => {
        if (!file) return;
        if (!validateImageFile(file)) return;
        setEditImage(file);
        setEditPreview(URL.createObjectURL(file));
        setDeleteExistingImage(false);
    };

    const handleEditFileSelect = (e) => setEditFileState(e.target.files[0]);

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                setEditFileState(file);
                e.preventDefault();
                return;
            }
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content || '');
        setEditPreview(post.image ? `${post.image}` : null);
        setEditImage(null);
        setDeleteExistingImage(false);
    };

    const cancelEditing = () => {
        setEditingPostId(null);
        setEditContent("");
        setEditImage(null);
        setEditPreview(null);
        setDeleteExistingImage(false);
    };

    const removeEditImage = () => {
        if (editImage) {
            setEditImage(null);
            setEditPreview(null);
        } else {
            setEditPreview(null);
            setDeleteExistingImage(true);
        }
    };

    const saveEdit = async (postId) => {
        if (!editContent.trim() && !editImage && !editPreview) {
            notifyError(t('post.empty_post'));
            return;
        }
        try {
            const updatedPostData = await PostService.update(postId, {
                content: editContent,
                image: editImage,
                deleteImage: deleteExistingImage
            });
            setPosts(posts.map(p => p.id === postId ? updatedPostData : p));
            notifySuccess(t('success.changes_saved'));
            cancelEditing();
        } catch (error) {
            notifyError(t('error.save_changes'));
        }
    };

    const handleDelete = async (postId) => {
        const isConfirmed = await openConfirm(t('post.delete_post'));
        if (!isConfirmed) return;
        try {
            await PostService.delete(postId);
            setPosts(posts.filter(p => p.id !== postId));
            setCountPosts(countPosts - 1);
        } catch (error) {
            notifyError(t('error.deleting'));
        }
    };

    return {
        posts, countPosts,
        createPost,
        editingPostId,
        editContent, setEditContent,
        editPreview,
        setEditImage, handleEditFileSelect, setEditPreview, handlePaste,
        startEditing, cancelEditing, saveEdit, removeEditImage,
        handleDelete,
        hasMore, isLoadingMore, loadMore,
        isPageLoading
    };
};