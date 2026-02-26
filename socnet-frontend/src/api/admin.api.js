import api from "./axios";

const adminAPI =
{
    // отримати юзерів (з пошуком)
    getUsers: async (search = '', page = 1) => {
        const res = await api.get(`/admin/users?search=${search}&page=${page}`);
        return res.data;
    },

    // замутити/розмутити
    toggleMute: async (username, reason) => {
        const res = await api.post(`/admin/users/${username}/mute`, { reason });
        return res.data;
    },

    // забанити/розбанити
    toggleBan: async (username, reason) => {
        const res = await api.post(`/admin/users/${username}/ban`, { reason });
        return res.data;
    },

    // отримати пости для модерації (з пошуком)
    getPosts: async (username = '', page = 1) => {
        const res = await api.get(`/admin/posts?username=${username}&page=${page}`);
        return res.data;
    }
};

export default adminAPI;