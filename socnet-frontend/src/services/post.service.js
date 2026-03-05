import postAPI from "../api/post.api";

class PostService {
    async create(data) {
        const formData = new FormData();

        if (data.content) formData.append('content', data.content);
        if (data.original_post_id) formData.append('original_post_id', data.original_post_id);
        if (data.target_user_id) formData.append('target_user_id', data.target_user_id);

        if (data.images && data.images.length > 0) {
            data.images.forEach(file => {
                formData.append('media[]', file);
            });
        }

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

        if (data.content !== undefined && data.content !== null) {
            formData.append('content', data.content);
        }

        if (data.images && data.images.length > 0) {
            data.images.forEach(file => {
                formData.append('media[]', file);
            });
        }

        if (data.deletedMedia && data.deletedMedia.length > 0)
            data.deletedMedia.forEach(mediaId => {
                formData.append('deleted_media[]', mediaId);
            });

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
}

export default new PostService();