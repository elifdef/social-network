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

    // для створення
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

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

            // якщо це перша сторінка - замінюємо пости, ні - в кінець
            // з фільтрацією щоб уникнути повторів ключів під час рендеру
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
            if (pageNumber === 1)
                setIsPageLoading(false);
            else
                setIsLoadingMore(false);
        }
    };

    // перше завантаження
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setPosts([]);
        setIsPageLoading(true);
        fetchPosts(1);
    }, [profileUser?.username]);

    // для другого/третього/.../n-го завантаження
    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    }, [isLoadingMore, hasMore, page, profileUser?.username]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const setFileState = (file, setImageState, setPreviewState) => {
        if (!file) return;
        if (!validateImageFile(file)) return;

        setImageState(file);
        setPreviewState(URL.createObjectURL(file));
        if (setImageState === setEditImage) setDeleteExistingImage(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setFileState(e.dataTransfer.files[0], setImage, setPreview);
    };

    // для інпута при створенні
    const handleFileSelect = (e) => {
        setFileState(e.target.files[0], setImage, setPreview);
    };

    // для інпута при редагуванні
    const handleEditFileSelect = (e) => {
        setFileState(e.target.files[0], setEditImage, setEditPreview);
    };

    const handlePaste = (e, target = 'create') => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                (target === 'edit')
                    ? setFileState(file, setEditImage, setEditPreview)
                    : setFileState(file, setImage, setPreview);
                e.preventDefault();
                return;
            }
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !image) {
            notifyError(t('post.empty_post'));
            return;
        }
        try {
            const newPost = await PostService.create({ image, content });
            setPosts([newPost, ...posts]);
            setCountPosts(countPosts + 1);
            setContent('');
            setImage(null);
            setPreview(null);
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
        }
    };

    const removeImage = () => { setImage(null); setPreview(null); };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content || '');
        // стара картинка як превю
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
        // якщо вибрали НОВИЙ файл і передумали то просто зануляєм
        if (editImage) {
            setEditImage(null);
            setEditPreview(null);
        } else {
            // якщо це СТАРА картинка з сервера
            setEditPreview(null);
            setDeleteExistingImage(true); // мітка на видалення
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
        content, setContent, image, preview, isDragging,
        handleDragOver, handleDragLeave, handleDrop, handlePaste, handleFileSelect, handleSubmit, removeImage, removeEditImage,
        editingPostId,
        editContent, setEditContent,
        editPreview,
        setEditImage, handleEditFileSelect, setEditPreview,
        startEditing, cancelEditing, saveEdit,
        handleDelete,
        hasMore, isLoadingMore, loadMore,
        isPageLoading
    };
};