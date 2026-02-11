import { useState, useEffect } from 'react';
import api from '../api/axios';
import { notifySuccess, notifyConfirmAction, notifyError } from "../components/Notify"
import { validateImageFile } from "../services/upload";
import { mapPost } from '../services/mappers';
import { useTranslation } from 'react-i18next';

export const useUserWall = (profileUser) => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);

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

    // Завантаження постів
    useEffect(() => {
        if (!profileUser?.username) return;
        const fetchPosts = async () => {
            try {
                const response = await api.get(`/users/${profileUser.username}/posts`);
                const processedPosts = response.data.data.map(mapPost);
                setPosts(processedPosts);
            } catch (err) {
                (err.response && err.response.status === 403)
                    ? setPosts([])
                    : notifyError(t('error.loading_post'));
            }
        };

        fetchPosts();
    }, [profileUser.username]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const setFileState = (file, setImageState, setPreviewState) => {
        if (!file) return;
        if (!validateImageFile(file)) return;

        setImageState(file);
        setPreviewState(URL.createObjectURL(file));

        if (setImageState === setEditImage)
            setDeleteExistingImage(false);
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
        const formData = new FormData();
        if (content) formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            const res = await api.post('/posts', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setPosts([mapPost(res.data), ...posts]);
            setContent('');
            setImage(null);            
        } catch (error) {
            notifyError(t('common.error'));
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
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('content', editContent);

        // якщо вибрали нову картинку
        if (editImage)
            formData.append('image', editImage);

        // якщо натиснули хрестик на старій картинці
        if (deleteExistingImage)
            formData.append('delete_image', '1');

        try {
            const res = await api.post(`/posts/${postId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setPosts(posts.map(p => p.id === postId ? res.data : p));
            notifySuccess(t('success.changes_saved'));
            cancelEditing();
        } catch (error) {
            notifyError(t('error.save_changes'));
        }
    };

    const handleDelete = async (postId) => {
        const isConfirmed = await notifyConfirmAction(t('post.delete_post'));
        if (!isConfirmed) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            notifyError(t('error.deleting'));
        }
    };

    return {
        posts,
        content, setContent, image, preview, isDragging,
        handleDragOver, handleDragLeave, handleDrop, handlePaste, handleFileSelect, handleSubmit, removeImage, removeEditImage,
        editingPostId,
        editContent, setEditContent,
        editPreview,
        setEditImage, handleEditFileSelect, setEditPreview,
        startEditing, cancelEditing, saveEdit,
        handleDelete
    };
};