import postAPI from "../api/post.api";

class PostService {
    async create(data) {
        const formData = new FormData();

        if (data.content) formData.append('content', data.content);
        if (data.target_user_id) formData.append('target_user_id', data.target_user_id);
        if (data.entities) formData.append('entities', data.entities);
        if (data.images && data.images.length > 0) {
            data.images.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });
        }

        const response = await postAPI.post(formData);

        return response.data;
    }

    async update(id, data) {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (data.content) formData.append('content', data.content);
        if (data.entities) formData.append('entities', data.entities);
        if (data.images && data.images.length > 0) {
            data.images.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });
        }
        if (data.deletedMedia && data.deletedMedia.length > 0) {
            data.deletedMedia.forEach((mediaId, index) => {
                formData.append(`deleted_media[${index}]`, mediaId);
            });
        }

        const response = await postAPI.put(id, formData);

        return response.data;
    }

    async get(id) {
        const res = await postAPI.get(id);
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
}

export default new PostService();