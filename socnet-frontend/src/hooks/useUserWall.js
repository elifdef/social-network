import { useState, useEffect } from 'react';
import api from '../api/axios';
import { notifySuccess, notifyConfirmAction, notifyError, notifyWarn } from "../components/Notify"

export const useUserWall = (profileUser) => {
    const [posts, setPosts] = useState([]);

    // для створення
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // для редагування
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [editPreview, setEditPreview] = useState(null);
    const [deleteExistingImage, setDeleteExistingImage] = useState(false);

    // Завантаження постів
    useEffect(() => {
        if (!profileUser?.username) return;
        const fetchPosts = async () => {
            try {
                const response = await api.get(`/users/${profileUser.username}/posts`);
                setPosts(response.data.data);
            } catch (err) {
                (err.response && err.response.status === 403)
                    ? setPosts([])
                    : console.error("Error fetching posts:", err);
            }
        };

        fetchPosts();
    }, [profileUser.username]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                notifyWarn('Файл занадто великий. Максимальний розмір: 5 МБ.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                notifyError('Будь ласка, завантажте зображення.');
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        } else {
            notifyWarn("Можна кидати тільки картинки!");
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !image) {
            notifyError("Пост не може бути порожнім.");
            return;
        }
        const formData = new FormData();
        if (content) formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            const res = await api.post('/posts', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setPosts([res.data, ...posts]);
            setContent('');
            setImage(null);
            setPreview(null);
        } catch (error) {
            notifyError("Помилка публікації");
        }
    };

    const removeImage = () => { setImage(null); setPreview(null); };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
        // стара картинка як превю
        setEditPreview(post.image ? `http://localhost:8000/storage/${post.image}` : null);
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
        if (!content.trim() && !image) {
            notifyError("Пост не може бути порожнім.");
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
            notifySuccess("Збережено!");
            cancelEditing();
        } catch (error) {
            console.error(error);
            notifyError("Помилка збереження");
        }
    };

    const handleDelete = async (postId) => {
        const isConfirmed = await notifyConfirmAction("Видалити цей запис?");
        if (!isConfirmed) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            notifyError("Помилка");
        }
    };

    const getDeclension = (number) => {
        const words = ['запис', 'записа', 'записів'];
        const cases = [2, 0, 1, 1, 1, 2];
        return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
    };

    return {
        posts,
        content, setContent, image, preview, isDragging,
        handleDragOver, handleDragLeave, handleDrop, handleFileSelect, handleSubmit, removeImage, removeEditImage,
        editingPostId,
        editContent, setEditContent,
        editPreview,
        setEditImage, setEditPreview,
        startEditing, cancelEditing, saveEdit,
        handleDelete, getDeclension
    };
};