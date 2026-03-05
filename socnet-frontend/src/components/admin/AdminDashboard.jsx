import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { notifyError } from '../common/Notify';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [t]);

    const fetchStats = () => {
        setLoading(true);
        api.get('/admin/dashboard')
            .then(res => setStats(res.data))
            .catch(err => {
                console.error(err);
                notifyError(t('admin.error_load_stats'));
            })
            .finally(() => setLoading(false));
    };

    if (loading && !stats) {
        return <div className="socnet-empty-state">{t('common.loading')}</div>;
    }

    if (!stats) return null;

    return (
        <div className="admin-dashboard-wrapper">
            <div className="admin-dashboard-header">
                <span className="admin-timeframe-badge">{t('admin.last_7_days')}</span>
                <button className="socnet-btn-small" onClick={fetchStats}>
                    {t('common.reload_page')}
                </button>
            </div>

            <div className="admin-dossier-row admin-stats-row">
                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('common.users')}</div>
                    <div className="admin-stats-value">{stats.summary.users}</div>
                </div>

                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('common.posts')}</div>
                    <div className="admin-stats-value">{stats.summary.posts}</div>
                </div>

                <div className="admin-stats-box">
                    <div className="admin-stats-label">{t('common.comments')}</div>
                    <div className="admin-stats-value">{stats.summary.comments}</div>
                </div>
            </div>

            <div className="admin-tables-row admin-infrastructure-row">
                <div className="admin-table-card admin-server-card">
                    <h3 className="admin-chart-title">{t('admin.server_health')}</h3>

                    <div className="admin-server-metric">
                        <div className="admin-server-metric-header">
                            <span>{t('admin.cpu_load')}</span>
                            <span>{stats.server.cpu_load}%</span>
                        </div>
                        <div className="admin-progress-track">
                            <div className="admin-progress-bar cpu" style={{ width: `${Math.min(stats.server.cpu_load * 10, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="admin-server-metric">
                        <div className="admin-server-metric-header">
                            <span>{t('admin.disk_usage')} ({stats.server.disk_free_gb} GB {t('admin.free')})</span>
                            <span>{stats.server.disk_percent}%</span>
                        </div>
                        <div className="admin-progress-track">
                            <div className="admin-progress-bar disk" style={{ width: `${stats.server.disk_percent}%` }}></div>
                        </div>
                    </div>

                    <div className="admin-server-info-row">
                        <span className="socnet-label">PHP {t('admin.version')}:</span>
                        <span className="socnet-value">{stats.server.php_version}</span>
                    </div>
                    <div className="admin-server-info-row">
                        <span className="socnet-label">{t('admin.ram_usage')}:</span>
                        <span className="socnet-value">{stats.server.memory_mb} MB</span>
                    </div>
                </div>

                <div className="admin-table-card admin-online-card">
                    <h3 className="admin-chart-title">
                        {t('admin.users_online')}
                        <span className="admin-online-badge">{stats.realtime.online_count}</span>
                    </h3>

                    {stats.realtime.users.length === 0 ? (
                        <div className="socnet-empty-state">{t('admin.no_one_online')}</div>
                    ) : (
                        <div className="admin-online-list">
                            {stats.realtime.users.map(user => (
                                <Link key={user.id} to={`/${user.username}`} className="admin-online-user">
                                    <img src={user.avatar} alt="avatar" className="admin-online-avatar" />
                                    <div className="admin-online-details">
                                        <span className="admin-online-name">{user.first_name} {user.last_name}</span>
                                        <span className="admin-online-nick">@{user.username}</span>
                                    </div>
                                    <div className="admin-online-indicator"></div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="admin-tables-row">
                <div className="admin-table-card admin-chart-card">
                    <h3 className="admin-chart-title">{t('admin.registrations_chart')}</h3>
                    <div className="admin-chart-container">
                        <ResponsiveContainer>
                            <LineChart data={stats.charts.registrations} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--theme-text-muted)" fontSize={10} tickMargin={10} />
                                <YAxis stroke="var(--theme-text-muted)" fontSize={10} allowDecimals={false} />
                                <Tooltip contentClassName="admin-chart-tooltip" wrapperClassName="admin-chart-tooltip-wrapper" />
                                <Line type="monotone" dataKey="count" name={t('admin.new_users')} stroke="var(--theme-success)" strokeWidth={3} activeDot={{ r: 6, fill: 'var(--theme-success)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-table-card admin-chart-card">
                    <h3 className="admin-chart-title">{t('admin.activity_chart')}</h3>
                    <div className="admin-chart-container">
                        <ResponsiveContainer>
                            <BarChart data={stats.charts.activity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--theme-text-muted)" fontSize={10} tickMargin={10} />
                                <YAxis stroke="var(--theme-text-muted)" fontSize={10} allowDecimals={false} />
                                <Tooltip contentClassName="admin-chart-tooltip" wrapperClassName="admin-chart-tooltip-wrapper" />
                                <Legend wrapperClassName="admin-chart-legend" />
                                <Bar dataKey="posts" name={t('common.posts')} fill="var(--theme-link)" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="comments" name={t('common.comments')} fill="var(--theme-error)" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}