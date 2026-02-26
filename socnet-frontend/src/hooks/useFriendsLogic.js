import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useFriendship } from "../hooks/useFriendship";
import { usePageTitle } from "../hooks/usePageTitle";
import { notifySuccess, notifyError } from "../components/common/Notify";
import { useModal } from "../context/ModalContext";
import { useTranslation } from 'react-i18next';

export const useFriendsLogic = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useContext(AuthContext);
    const { addFriend, acceptRequest, removeFriend, blockUser, unblockUser } = useFriendship();
    const [searchParams, setSearchParams] = useSearchParams();
    const { openConfirm } = useModal();

    const tabs = [
        { id: 'my', label: t('common.friends') },
        { id: 'requests', label: t('friends.requests') },
        { id: 'subscriptions', label: t('friends.subscriptions') },
        { id: 'blocked', label: t('friends.blacklist') },
        { id: 'all', label: t('friends.global_search') },
    ];

    const activeTab = searchParams.get('tab') || 'my';
    usePageTitle(tabs.find(t => t.id === activeTab)?.label || t('common.friends'));

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // useRef для збереження контролера щоб скасовувати запити
    const abortControllerRef = useRef(null);

    const fetchUsers = useCallback(async (tab, query) => {
        // скасування попереднього запиту
        if (abortControllerRef.current)
            abortControllerRef.current.abort();

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);

        try {
            let endpoint = '/friends';
            switch (tab) {
                case 'requests': endpoint = '/friends/requests'; break;
                case 'subscriptions': endpoint = '/friends/sent'; break;
                case 'blocked': endpoint = '/friends/blocked'; break;
                case 'all': endpoint = `/users?search=${query}`; break;
                case 'my': default: endpoint = '/friends'; break;
            }

            const res = await api.get(endpoint, { signal: controller.signal });
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setUsers(data);

        } catch (err) {
            if (err.name !== "CanceledError") {
                if (err.response?.status === 404) 
                    setUsers([]);
                else 
                    notifyError(t('error.loading', { resource: "list" }));
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        setSearchQuery("");
        setUsers([]);
        fetchUsers(activeTab, "");

    }, [activeTab, fetchUsers]);

    const handleTabChange = (id) => setSearchParams({ tab: id });

    const handleSearchSubmit = () => {
        if (activeTab === 'all')
            fetchUsers('all', searchQuery.trim().toLowerCase());
    };

    const handleAction = async (action, username) => {
        if (action === 'delete' || action === 'block') {
            if (!(await openConfirm(t('common.are_u_sure')))) return;
        }

        try {
            let res;
            if (action === 'add') res = await addFriend(username);
            else if (action === 'accept') res = await acceptRequest(username);
            else if (action === 'delete' || action === 'cancel_request') res = await removeFriend(username);
            else if (action === 'block') res = await blockUser(username);
            else if (action === 'unblock') res = await unblockUser(username);

            if (res?.success) {
                notifySuccess(res.message);
                activeTab !== 'all'
                    ? setUsers(prev => prev.filter(u => u.username !== username))
                    : fetchUsers('all', searchQuery.toLowerCase());
            }
            else 
                notifyError(res?.message);
        } catch (e) {
            notifyError(t('common.error'));
        }
    };

    return {
        tabs, activeTab, handleTabChange,
        searchQuery, setSearchQuery, handleSearchSubmit,
        users, loading,
        handleAction, currentUser, t
    };
};