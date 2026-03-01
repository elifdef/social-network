import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePageTitle } from "../../hooks/usePageTitle";
import api from '../../api/axios';
import { notifySuccess, notifyError } from '../common/Notify';
import { useTranslation } from 'react-i18next';
import Button from '../UI/Button';
import { useModal } from '../../context/ModalContext';
import { useDateFormatter } from '../../hooks/useDateFormatter';

export default function AdminUserInfo() {
    const { username } = useParams();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { openPrompt } = useModal();
    const formatDate = useDateFormatter();
    usePageTitle(username);

    const fetchUserDossier = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/admin/users/${username}`);
            setUser(res.data.data);
        } catch (error) {
            notifyError(t('admin.error_load_user'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDossier();
    }, [username]);

    const handleToggleAction = async (actionType, currentStatus) => {
        const actionText = actionType === 'ban'
            ? (currentStatus ? t('admin.unban') : t('admin.ban'))
            : (currentStatus ? t('admin.unmute') : t('admin.mute'));

        const reason = await openPrompt(
            t('admin.action_reason_prompt'),
            "",
            actionText,
            t('common.cancel')
        );

        if (reason === null) return;

        try {
            const res = await api.post(`/admin/users/${username}/${actionType}`, {
                reason: reason || t('admin.reason_not_specified')
            });

            notifySuccess(res.data.message);
            fetchUserDossier();
        } catch (error) {
            notifyError(error.response?.data?.message || t('admin.error_action'));
        }
    };

    if (isLoading) return <div className="socnet-empty-state">{t('admin.loading_dossier')}</div>;
    if (!user) return <div className="socnet-empty-state with-card">{t('admin.user_not_found')}</div>;

    return (
        <div className="admin-dossier-wrapper">
            <div className="socnet-card-wrapper admin-dossier-card">
                <h2>ID {user.id}: {user.first_name} {user.last_name} (@{user.username})</h2>
                <div className="admin-dossier-row">
                    <div className="admin-dossier-col">
                        <p><strong>{t('admin.email_label')}</strong> {user.email}</p>
                        <p><strong>{t('admin.registered_at')}</strong> {formatDate(user.created_at)}</p>
                        <p><strong>{t('admin.last_active')}</strong> {user.last_seen ? formatDate(user.last_seen) : t('admin.never')}</p>
                        <p><strong>{t('admin.account_status')}</strong>
                            {user.is_banned
                                ? <span className="admin-status-red"> {t('admin.status_banned')}</span>
                                : <span className="admin-status-green"> {t('admin.status_active')}</span>}
                            {user.is_muted && <span className="admin-status-orange"> {t('admin.status_muted')}</span>}
                        </p>
                    </div>

                    <div className="admin-stats-box">
                        <h4>{t('admin.content_stats')}</h4>
                        <p>{t('admin.posts_written')} <strong>{user.posts_count || 0}</strong></p>
                        <p>{t('admin.comments_left')} <strong>{user.comments_count || 0}</strong></p>
                        <p>{t('admin.likes_given')} <strong>{user.likes_count || 0}</strong></p>
                    </div>
                </div>

                <div className="admin-actions-box">
                    <h4>{t('admin.moderator_actions')}</h4>
                    <div className="admin-btn-group">
                        <Button
                            variant={user.is_muted ? 'primary' : 'save'}
                            onClick={() => handleToggleAction('mute', user.is_muted)}
                        >
                            {user.is_muted ? t('admin.unmute') : t('admin.mute')}
                        </Button>
                        <Button
                            className={user.is_banned ? 'admin-btn-unban' : 'admin-btn-ban'}
                            onClick={() => handleToggleAction('ban', user.is_banned)}
                        >
                            {user.is_banned ? t('admin.unban') : t('admin.ban')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="admin-tables-row">
                <div className="socnet-card-wrapper admin-table-card">
                    <h3>{t('admin.recent_logins')}</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.date')}</th>
                                <th>{t('admin.ip_address')}</th>
                                <th>{t('admin.device')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.login_history && user.login_history.length > 0 ? (
                                user.login_history.map(log => (
                                    <tr key={log.id}>
                                        <td>{formatDate(log.created_at)}</td>
                                        <td><strong>{log.ip_address}</strong></td>
                                        <td title={log.user_agent}>{log?.user_agent}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>{t('admin.history_empty')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="socnet-card-wrapper admin-table-card">
                    <h3>{t('admin.violation_history')}</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.date')}</th>
                                <th>{t('admin.action')}</th>
                                <th>{t('admin.reason')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.moderation_logs && user.moderation_logs.length > 0 ? (
                                user.moderation_logs.map(log => {
                                    const isPositiveAction = log.action.includes('un');
                                    return (
                                        <tr key={log.id}>
                                            <td>{formatDate(log.created_at)}</td>
                                            <td>
                                                <span className={`admin-badge ${isPositiveAction ? 'admin-badge-positive' : 'admin-badge-negative'}`}>
                                                    {log.action.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>{log.reason}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>{t('admin.no_violations')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}