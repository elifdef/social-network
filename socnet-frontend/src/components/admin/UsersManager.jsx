import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminAPI from '../../api/admin.api';
import { userRole } from '../../config';
import { notifySuccess, notifyError } from "../common/Notify";
import { useModal } from '../../context/ModalContext';
import { usePageTitle } from "../../hooks/usePageTitle";

const UserSearchForm = ({ search, setSearch, handleSearch }) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={handleSearch} className="admin-search-bar">
            <div style={{ flex: 1 }}>
                <label className="socnet-form-label">{t('admin.search_user')}</label>
                <input
                    type="text"
                    className="socnet-form-input"
                    placeholder={t('admin.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button type="submit" className="socnet-btn">{t('common.find')}</button>
        </form>
    );
};

const UserCard = ({ user, handleMute, handleBan, canBan }) => {
    const { t } = useTranslation();
    const isAdmin = user.role === userRole.Admin;

    return (
        <div className="admin-user-card">
            <img src={user.avatar} alt="avatar" className="admin-user-avatar" />

            <div className="admin-user-info">
                <a
                    href={`/${isAdmin ? 'admin/users/' : ''}${user.username}`}
                    className="admin-user-name"
                    target="_blank"
                    rel="noreferrer"
                >
                    {user.first_name} {user.last_name}
                </a>
                <div className="admin-user-meta">
                    @{user.username} • {user.email} • {t('admin.posts_count', { count: user.posts_count || 0 })}
                </div>
                <div className="admin-user-status">
                    {user.is_banned ? <span className="admin-status-banned">{t('admin.status_banned_full')}</span>
                        : user.is_muted ? <span className="admin-status-muted">{t('admin.read_only')}</span>
                            : null}
                </div>
            </div>

            {user.role < userRole.Moderator && (
                <div className="admin-user-actions">
                    <button
                        className={`admin-btn admin-btn-warning ${user.is_muted ? 'active' : ''}`}
                        onClick={() => handleMute(user.username, user.is_muted)}
                    >
                        {user.is_muted ? t('admin.allow_posting') : t('admin.forbid_posting')}
                    </button>
                    {canBan && (
                        <button
                            className={`admin-btn admin-btn-danger ${user.is_banned ? 'active' : ''}`}
                            onClick={() => handleBan(user.username, user.is_banned)}
                        >
                            {user.is_banned ? t('admin.unban') : t('admin.ban')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export const UsersManager = ({ canBan = true }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { openPrompt } = useModal();

    usePageTitle(t('admin.users_management'));

    const fetchUsers = async (searchQuery = '') => {
        setIsLoading(true);
        try {
            const data = await adminAPI.getUsers(searchQuery);
            setUsers(data.data || []);
        } catch (error) {
            console.error(t('admin.error_load_users'), error);
            notifyError(t('admin.error_load_users'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const handleMute = async (username, currentStatus) => {
        const reason = await openPrompt(
            t('admin.action_reason_prompt'),
            "",
            currentStatus ? t('admin.unmute') : t('admin.read_only'),
            t('common.cancel')
        );

        if (reason === null) return;

        try {
            const res = await adminAPI.toggleMute(username, reason);
            if (res.status) {
                setUsers(users.map(u => u.username === username ? { ...u, is_muted: !currentStatus } : u));
                notifySuccess(res.message || t('common.success'));
            }
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
        }
    };

    const handleBan = async (username, currentStatus) => {
        const reason = await openPrompt(
            t('admin.action_reason_prompt'),
            "",
            currentStatus ? t('admin.unban') : t('admin.ban'),
            t('common.cancel')
        );

        if (reason === null) return;

        try {
            const res = await adminAPI.toggleBan(username, reason);
            if (res.status) {
                setUsers(users.map(u => u.username === username ? { ...u, is_banned: !currentStatus } : u));
                notifySuccess(res.message || t('common.success'));
            }
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
        }
    };

    return (
        <div>
            <UserSearchForm
                search={search}
                setSearch={setSearch}
                handleSearch={handleSearch}
            />

            {isLoading ? (
                <div className="socnet-feed-loading">{t('common.loading')}</div>
            ) : (
                <div className="admin-users-list">
                    {users.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                            handleMute={handleMute}
                            handleBan={handleBan}
                            canBan={canBan}
                        />
                    ))}
                    {users.length === 0 && (
                        <div className="socnet-feed-empty">{t('admin.users_not_found')}</div>
                    )}
                </div>
            )}
        </div>
    );
};