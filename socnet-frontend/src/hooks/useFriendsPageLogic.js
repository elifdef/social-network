import { useState, useEffect, useContext, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useFriendship } from "../hooks/useFriendship";
import { usePageTitle } from "../hooks/usePageTitle";
import { notifySuccess, notifyError, notifyLoading, dismissToast, notifyConfirmAction } from '../components/Notify';

export const useFriendsPageLogic = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { addFriend, acceptRequest, removeFriend, blockUser, unblockUser } = useFriendship();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabs = [
        { id: 'my', label: 'Друзі' },
        { id: 'requests', label: 'Вхідні заявки' },
        { id: 'subscriptions', label: 'Мої підписки' },
        { id: 'all', label: 'Пошук' },
        { id: 'blocked', label: 'Чорний список' }
    ];

    const activeTab = searchParams.get('tab') || 'my';

    const currentTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Друзі';
    usePageTitle(currentTabLabel);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const abortControllerRef = useRef(null);

    const handleTabChange = (newTab) => {
        setSearchParams({ tab: newTab });
        setSearchQuery("");
    };

    const fetchUsers = async (query = "", signal) => {
        setLoading(true);
        try {
            let endpoint = '/friends';
            switch (activeTab) {
                case 'requests': endpoint = '/friends/requests'; break;
                case 'subscriptions': endpoint = '/friends/sent'; break;
                case 'blocked': endpoint = '/friends/blocked'; break;
                case 'all': endpoint = `/users?search=${query}`; break;
                case 'my': default: endpoint = '/friends'; break;
            }

            const res = await api.get(endpoint, { signal });
            setUsers(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (err) {
            if (err.name !== "CanceledError") {
                notifyError("Не вдалося завантажити список");
            }
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    useEffect(() => {
        setUsers([]);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const newController = new AbortController();
        abortControllerRef.current = newController;

        if (activeTab === 'all' && searchQuery) {
            const timeoutId = setTimeout(() => fetchUsers(searchQuery, newController.signal), 500);
            return () => clearTimeout(timeoutId);
        } else {
            fetchUsers(searchQuery, newController.signal);
        }
        return () => newController.abort();
    }, [activeTab, searchQuery]);

    const handleAction = async (action, username) => {
        if (action === 'delete' || action === 'block') {
            const message = action === 'block' ? `Заблокувати @${username}?` : `Видалити @${username}?`;
            if (!(await notifyConfirmAction(message))) return;
        }

        const loadingId = notifyLoading('Обробка...');
        let result;

        try {
            switch (action) {
                case 'add': result = await addFriend(username); break;
                case 'accept': result = await acceptRequest(username); break;
                case 'delete':
                case 'cancel_request': result = await removeFriend(username); break;
                case 'block': result = await blockUser(username); break;
                case 'unblock': result = await unblockUser(username); break;
                default: dismissToast(loadingId); return;
            }
        } catch (e) {
            dismissToast(loadingId);
            notifyError("Помилка сервера");
            return;
        }

        dismissToast(loadingId);

        if (result?.success) {
            notifySuccess(result.message);

            if (activeTab !== 'all')
                setUsers(prev => prev.filter(u => u.username !== username));
            else
                fetchUsers(searchQuery, abortControllerRef.current?.signal);

        } else if (result) {
            notifyError(result.message);
        }
    };

    // Фільтрація на клієнті (для вкладок, крім пошуку)
    const filteredUsers = users.filter(u => {
        if (activeTab === 'all') return true;
        if (u.id === currentUser?.id) return false;
        const search = searchQuery.toLowerCase();
        return (u.first_name + " " + u.last_name).toLowerCase().includes(search) ||
            u.username.toLowerCase().includes(search);
    });

    return {
        tabs,
        activeTab,
        handleTabChange,
        searchQuery,
        setSearchQuery,
        loading,
        users,
        filteredUsers,
        handleAction,
        currentUser
    };
};