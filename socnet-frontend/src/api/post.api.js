import api from "./axios";

const postAPI =
{
    // створити пост
    post: async (data) => {
        const res = await api.post("/posts", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res;
    },

    // отримати один пост по його ID(String)
    get: async (id) => {
        const res = await api.get(`/posts/${id}`);
        return res;
    },

    // оновити пост
    put: async (id, data) => {
        const res = await api.post(`/posts/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res;
    },

    // видалити пост
    delete: async (id) => {
        const res = await api.delete(`/posts/${id}`);
        return res;
    },

    // отримати всі пости конкретного користувача (pageNumber - пагінація сторінок)
    userPosts: async (username, pageNumber) => {
        const res = await api.get(`/users/${username}/posts?page=${pageNumber}`)
        return res;
    }
};

export default postAPI;