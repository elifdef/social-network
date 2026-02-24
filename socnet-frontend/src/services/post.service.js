import PostAPI from "../api/post.api";

class PostService {
    async create(data) {
        const formData = new FormData();

        if (data.content) formData.append('content', data.content);
        if (data.image) formData.append('image', data.image);

        const res = await PostAPI.post(formData);
        return res.data;
    }

    async get(id) {
        const res = await PostAPI.get(id);
        return res.data;
    }

    async update(id, data) {
        const formData = new FormData();

        formData.append('_method', 'PUT');
        if (data.content !== undefined && data.content !== null) formData.append('content', data.content);
        if (data.image) formData.append('image', data.image);
        if (data.deleteImage) formData.append('delete_image', '1');

        const res = await PostAPI.put(id, formData);
        return res.data;
    }

    async delete(id) {
        const res = await PostAPI.delete(id);
        return res;
    }

    async getUserPosts(username, pageNumber = 1) {
        const res = await PostAPI.userPosts(username, pageNumber);
        return res.data;
    }
};

export default new PostService();