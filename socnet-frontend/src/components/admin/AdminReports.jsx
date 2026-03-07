import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import { notifySuccess, notifyError } from "../common/Notify";
import { useModal } from "../../context/ModalContext";
import { useDateFormatter } from "../../hooks/useDateFormatter";

export default function AdminReports() {
    const { t } = useTranslation();
    const { openPrompt } = useModal();
    const formatDate = useDateFormatter();
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/reports?status=${statusFilter}`);
            setStats(res.data.stats);
            setReports(res.data.reports.data);
        } catch (error) {
            notifyError(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [statusFilter, t]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleAction = async (reportId, actionType) => {
        const title = actionType === 'resolve'
            ? t('admin.reports.prompt_resolve')
            : t('admin.reports.prompt_reject');

        const responseText = await openPrompt(
            t('admin.common.prompt_placeholder'),
            title,
            true
        );

        if (responseText === null) return;

        try {
            const endpoint = `/admin/reports/${reportId}/${actionType}`;
            await api.post(endpoint, { admin_response: responseText.trim() });

            notifySuccess(t('common.saved'));
            fetchReports();
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
        }
    };

    const renderReportTarget = (report) => {
        if (!report.reportable) {
            return (
                <span className="socnet-settings-desc">
                    {t('admin.reports.target_deleted', { id: report.reportable_id })}
                </span>
            );
        }

        const type = report.reportable_type.split('\\').pop();

        if (type === 'Post') {
            return (
                <Link to={`/post/${report.reportable.id}`} className="socnet-link" target="_blank">
                    {t('admin.reports.target_post', { date: formatDate(report.reportable.created_at) })}
                </Link>
            );
        }

        if (type === 'Comment') {
            return (
                <div className="admin-report-comment-target">
                    <span className="socnet-value">
                        {t('admin.reports.target_comment', { date: formatDate(report.reportable.created_at) })}
                    </span>
                    {report.reportable.content && (
                        <span className="socnet-notification-snippet">
                            "{report.reportable.content}"
                        </span>
                    )}
                </div>
            );
        }

        if (type === 'User') {
            return (
                <Link to={`/${report.reportable.username}`} className="socnet-link" target="_blank">
                    {report.reportable.first_name} {report.reportable.last_name} (@{report.reportable.username})
                </Link>
            );
        }

        return <span>{type} (ID: {report.reportable_id})</span>;
    };

    return (
        <div>
            <div className="admin-dossier-row admin-stats-container">
                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('admin.stats.total')}</div>
                    <div className="admin-stats-value">{stats.total}</div>
                </div>
                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('admin.stats.pending')}</div>
                    <div className="admin-stats-value admin-status-orange">{stats.pending}</div>
                </div>
                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('admin.stats.resolved')}</div>
                    <div className="admin-stats-value admin-status-green">{stats.resolved}</div>
                </div>
                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('admin.stats.rejected')}</div>
                    <div className="admin-stats-value admin-status-red">{stats.rejected}</div>
                </div>
            </div>

            <div className="socnet-tabs">
                <button
                    className={`socnet-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                >
                    {t('admin.stats.pending')}
                </button>
                <button
                    className={`socnet-tab ${statusFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('resolved')}
                >
                    {t('admin.stats.resolved')}
                </button>
                <button
                    className={`socnet-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('rejected')}
                >
                    {t('admin.stats.rejected')}
                </button>
            </div>

            {loading ? (
                <div className="socnet-empty-state">{t('common.loading')}</div>
            ) : reports.length === 0 ? (
                <div className="socnet-empty-state with-card">{t('admin.reports.empty')}</div>
            ) : (
                <div className="socnet-feed-list">
                    {reports.map((report) => (
                        <div key={report.id} className="admin-user-card">
                            <div className="admin-user-info">

                                <div className="socnet-info-row">
                                    <span className="socnet-label">{t('admin.reports.from')}</span>
                                    <span className="socnet-value">
                                        <Link to={`/${report.reporter?.username}`} className="socnet-link">
                                            {report.reporter?.first_name} {report.reporter?.last_name}
                                        </Link>
                                    </span>
                                </div>

                                <div className="socnet-info-row">
                                    <span className="socnet-label">{t('admin.reports.reason')}</span>
                                    <span className="socnet-value admin-status-red">
                                        {t(`reports.reasons.${report.reason}`)}
                                    </span>
                                </div>

                                <div className="socnet-info-row">
                                    <span className="socnet-label">{t('admin.reports.target')}</span>
                                    <span className="socnet-value">
                                        {renderReportTarget(report)}
                                    </span>
                                </div>

                                {report.details && (
                                    <div className="socnet-settings-quote admin-report-quote">
                                        {report.details}
                                    </div>
                                )}

                                {report.admin_response && (
                                    <div className="banned-reason-box admin-report-response-box">
                                        <div className="banned-reason-label">{t('admin.common.admin_response')}</div>
                                        <div className="banned-reason-text">{report.admin_response}</div>
                                    </div>
                                )}
                            </div>

                            {report.status === 'pending' && (
                                <div className="admin-user-actions">
                                    <button
                                        className="admin-btn admin-btn-danger"
                                        onClick={() => handleAction(report.id, 'resolve')}
                                    >
                                        {t('admin.reports.btn_resolve')}
                                    </button>
                                    <button
                                        className="admin-btn admin-btn-warning"
                                        onClick={() => handleAction(report.id, 'reject')}
                                    >
                                        {t('admin.reports.btn_reject')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}