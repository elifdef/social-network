import api from "../api/axios";
import { useCallback } from "react";
import { useTranslation } from 'react-i18next';

export const useFriendship = () => {
    const { t } = useTranslation();

    // useCallback щоб функції не перестворювались при рендерах
    const addFriend = useCallback(async (username) => {
        try {
            await api.post('/friends/add', { username });
            return { success: true, message: t('friends.request_sent') };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || t('common.error') };
        }
    }, []);

    const acceptRequest = useCallback(async (username) => {
        try {
            await api.post('/friends/accept', { username });
            return { success: true, message: t('friends.accept_request') };
        } catch (err) {
            return { success: false, message: err.response?.data?.message ||  t('common.error') };
        }
    }, []);

    const removeFriend = useCallback(async (username) => {
        try {
            await api.delete(`/friends/${username}`);
            return { success: true, message: t('friends.removed_from_friends') };
        } catch (err) {
            return { success: false, message: err.response?.data?.message ||  t('common.error') };
        }
    }, []);

    const blockUser = useCallback(async (username) => {
        try {
            await api.post('/friends/block', { username });
            return { success: true, message: t('friends.user_blocked') };
        } catch (err) {
            return { success: false, message: err.response?.data?.message ||  t('common.error') };
        }
    }, []);

    const unblockUser = useCallback(async (username) => {
        try {
            await api.delete(`/friends/blocked/${username}`);
            return { success: true, message: t('friends.user_unblocked') };
        } catch (err) {
            return { success: false, message: err.response?.data?.message ||  t('common.error') };
        }
    }, []);

    return {
        addFriend,
        acceptRequest,
        removeFriend,
        blockUser,
        unblockUser
    };
};