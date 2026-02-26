import postAPI from "../api/post.api";

class PostService {
    async create(data) {
        const formData = new FormData();

        if (data.content) formData.append('content', data.content);
        if (data.image) formData.append('image', data.image);

        const res = await postAPI.post(formData);
        return res.data;
    }

    async get(id) {
        const res = await postAPI.get(id);
        return res.data;
    }

    async update(id, data) {
        const formData = new FormData();

        formData.append('_method', 'PUT');
        if (data.content !== undefined && data.content !== null) formData.append('content', data.content);
        if (data.image) formData.append('image', data.image);
        if (data.deleteImage) formData.append('delete_image', '1');

        const res = await postAPI.put(id, formData);
        return res.data;
    }

    async delete(id) {
        const res = await postAPI.delete(id);
        return res;
    }

    async getUserPosts(username, pageNumber = 1) {
        const res = await postAPI.userPosts(username, pageNumber);
        return res.data;
    }
};

export default new PostService();