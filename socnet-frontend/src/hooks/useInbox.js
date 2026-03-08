import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../api/messages.api';
import { notifyError } from '../components/common/Notify';
export const useInbox = () => {
    const { t } = useTranslation();
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await chatApi.getChats();
            setChats(data);
        } catch (err) {
            notifyError(err.response?.data?.message || t('messages.errors.load_failed'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const initChat = async (targetUserId) => {
        try {
            const { data } = await chatApi.initChat(targetUserId);
            return data.chat_slug;
        } catch (err) {
            notifyError(err.response?.data?.message || t('messages.errors.init_failed'));
            throw err;
        }
    };

    return {
        chats,
        isLoading,
        fetchChats,
        initChat
    };
};