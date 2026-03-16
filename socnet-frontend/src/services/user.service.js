import fetchClient from "../api/client";

class UserService {
    async getProfile(username) {
        const data = await fetchClient(`/users/${username}`);
        return data.data || data;
    }

    async updateProfile(username, data) {
        return await fetchClient(`/users/${username}`, {
            method: 'POST',
            body: data
        });
    }

    async updateEmail(email, password) {
        return await fetchClient('/user/email', {
            method: 'PUT',
            body: { email, password }
        });
    }

    async updatePassword(current_password, password, password_confirmation) {
        return await fetchClient('/user/password', {
            method: 'PUT',
            body: { current_password, password, password_confirmation }
        });
    }

    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const data = await fetchClient(`/users?${queryString}`);
        return {
            items: data.data || [],
            meta: data.meta || null
        };
    }
}

export default new UserService();