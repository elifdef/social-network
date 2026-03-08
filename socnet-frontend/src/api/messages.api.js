import api from './axios';

export const chatApi = {
    getChats: () => api.get('/chat'),

    initChat: (targetUserId) => api.post('/chat/init', { target_user_id: targetUserId }),

    getMessages: (slug, page = 1) => api.get(`/chat/${slug}/messages?page=${page}`),

    sendMessage: (slug, text, files = [], sharedPostId = null, replyToId = null) => {
        const formData = new FormData();
        if (text) formData.append('text', text);
        if (sharedPostId) formData.append('shared_post_id', sharedPostId);
        if (replyToId) formData.append('reply_to_id', replyToId);
        files.forEach(file => formData.append('media[]', file));

        return api.post(`/chat/${slug}/message`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    updateMessage: (slug, messageId, text, newFiles = [], deletedMedia = []) => {
        const formData = new FormData();
        if (text) formData.append('text', text);

        newFiles.forEach(file => formData.append('media[]', file));
        deletedMedia.forEach(fileName => formData.append('deleted_media[]', fileName));

        return api.post(`/chat/${slug}/message/${messageId}/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteMessage: (slug, messageId) => api.delete(`/chat/${slug}/message/${messageId}`),

    deleteChat: (slug, forBoth) => api.delete(`/chat/${slug}`, { data: { for_both: forBoth } }),

    togglePin: (slug, messageId) => api.post(`/chat/${slug}/message/${messageId}/pin`)
};