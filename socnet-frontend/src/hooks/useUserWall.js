import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notifySuccess, notifyError } from "../components/common/Notify";
import { useModal } from "../context/ModalContext";
import { validateImageFile } from "../services/upload";
import PostService from '../services/post.service';
import { MAX_FILE_SIZE_KB } from "../config";

export const useUserWall = (profileUser) => {
    const { t } = useTranslation();
    const { openConfirm } = useModal();

    const [posts, setPosts] = useState([]);
    const [countPosts, setCountPosts] = useState(0);
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [existingMedia, setExistingMedia] = useState([]);         // cтарі картинки з БД
    const [deletedMediaIds, setDeletedMediaIds] = useState([]);     // ID видалених

    const [newEditImages, setNewEditImages] = useState([]);         // нові файли
    const [newEditPreviews, setNewEditPreviews] = useState([]);     // URL превюшок
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchPosts = async (pageNumber = 1) => {
        if (!profileUser?.username) return;

        if (pageNumber > 1) setIsLoadingMore(true);
        else setIsPageLoading(true);

        try {
            const res = await PostService.getUserPosts(profileUser.username, pageNumber);
            const processedPosts = res.data;

            if (pageNumber === 1) setPosts(processedPosts);
            else setPosts(prev => {
                const uniqueNewPosts = processedPosts.filter(
                    newPost => !prev.some(existingPost => existingPost.id === newPost.id)
                );
                return [...prev, ...uniqueNewPosts];
            });

            const meta = res.meta;
            setCountPosts(res.meta.total);
            setHasMore(meta.current_page < meta.last_page);
        } catch (err) {
            if (err.response && err.response.status === 403) setPosts([]);
            else notifyError(t('error.loading_post'));
        } finally {
            if (pageNumber === 1) setIsPageLoading(false);
            else setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1); setHasMore(true); setPosts([]); setIsPageLoading(true);
        fetchPosts(1);
    }, [profileUser?.username]);

    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    }, [isLoadingMore, hasMore, page, profileUser?.username]);

    const createPost = async (content, images) => {
        try {
            const newPost = await PostService.create({ images, content });
            setPosts([newPost, ...posts]);
            setCountPosts(countPosts + 1);
            return true;
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
            return false;
        }
    };

    const handleRepostSuccess = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setCountPosts(prev => prev + 1);
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content || '');
        setExistingMedia(post.attachments || []);
        setDeletedMediaIds([]);
        setNewEditImages([]);
        setNewEditPreviews([]);
    };

    const cancelEditing = () => {
        setEditingPostId(null);
        setEditContent("");
        setExistingMedia([]);
        setDeletedMediaIds([]);
        newEditPreviews.forEach(url => URL.revokeObjectURL(url));
        setNewEditImages([]);
        setNewEditPreviews([]);
    };

    const handleEditFileSelect = (e) => {
        const rawFiles = Array.from(e.target.files).filter(validateImageFile);
        const validFiles = [];
        let hasOversized = false;

        rawFiles.forEach(file => {
            if (file.size > MAX_FILE_SIZE_KB * 1024)
                hasOversized = true;
            else
                validFiles.push(file);
        });

        if (hasOversized)
            notifyError(t('error.file_too_large'));

        const totalFiles = existingMedia.length + newEditImages.length + validFiles.length;

        if (totalFiles > 10) {
            notifyError(t('error.max_files'));
            return;
        }

        setNewEditImages(prev => [...prev, ...validFiles]);
        setNewEditPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
        e.target.value = null;
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        const pastedFiles = [];
        let hasOversized = false;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file.size > MAX_FILE_SIZE_KB * 1024)
                    hasOversized = true;
                else
                    pastedFiles.push(file);
            }
        }

        if (hasOversized)
            notifyError(t('error.file_too_large'));

        if (pastedFiles.length > 0) {
            e.preventDefault();
            const totalFiles = existingMedia.length + newEditImages.length + pastedFiles.length;
            if (totalFiles > 10) {
                notifyError(t('error.max_files'));
                return;
            }
            setNewEditImages(prev => [...prev, ...pastedFiles]);
            setNewEditPreviews(prev => [...prev, ...pastedFiles.map(f => URL.createObjectURL(f))]);
        }
    };

    const removeNewEditImage = (index) => {
        setNewEditImages(prev => prev.filter((_, idx) => idx !== index));
        setNewEditPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, idx) => idx !== index);
        });
    };

    const removeExistingMedia = (mediaId) => {
        setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
        setDeletedMediaIds(prev => [...prev, mediaId]);
    };

    const saveEdit = async (postId) => {
        if (!editContent.trim() && existingMedia.length === 0 && newEditImages.length === 0) {
            notifyError(t('post.empty_post'));
            return;
        }
        try {
            const updatedPostData = await PostService.update(postId, {
                content: editContent,
                images: newEditImages,
                deletedMedia: deletedMediaIds
            });
            setPosts(prev => prev.map(p => p.id === postId ? updatedPostData : p));
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
            setPosts(prev => prev.filter(p => p.id !== postId));
            setCountPosts(prev => prev - 1);

        } catch (error) {
            notifyError(t('error.deleting'));
        }
    };

    return {
        posts, countPosts, isPageLoading, hasMore, isLoadingMore, loadMore,
        createPost, handleDelete,
        editingPostId, editContent, setEditContent,
        existingMedia, newEditPreviews, handleRepostSuccess,
        startEditing, cancelEditing, saveEdit, handlePaste,
        handleEditFileSelect, removeNewEditImage, removeExistingMedia
    };
};