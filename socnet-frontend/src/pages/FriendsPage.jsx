import { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/Friends.css";

export default function FriendsPage() {
    const { user: currentUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('my');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const abortControllerRef = useRef(null);

    // Функція завантаження (приймає signal для скасування)
    const fetchUsers = async (query = "", signal) => {
        setLoading(true);
        try {
            let endpoint = '/friends';
            if (activeTab === 'requests') endpoint = '/friends/requests';
            else if (activeTab === 'blocked') endpoint = '/friends/blocked';
            else if (activeTab === 'all') endpoint = `/users?search=${query}`;

            const res = await api.get(endpoint, { signal });

            // Якщо ми тут, значить запит не скасовано
            setUsers(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (err) {
            if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                console.error("Помилка завантаження:", err);
            }
        } finally {
            // Вимикаємо лоадер тільки якщо запит не був скасований
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        // 1. Скасовуємо попередній запит, якщо він ще висить
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // 2. Створюємо новий контролер
        const newController = new AbortController();
        abortControllerRef.current = newController;

        // 3. Робимо запит
        // Якщо це пошук і є текст - робимо затримку
        if (activeTab === 'all' && searchQuery) {
            const timeoutId = setTimeout(() => {
                fetchUsers(searchQuery, newController.signal);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            // Звичайний запит без затримки
            fetchUsers(searchQuery, newController.signal);
        }

        return () => {
            newController.abort();
        };
    }, [activeTab, searchQuery]);

    const handleAction = async (action, username) => {
        // потім зробити рефакторинг цього "шедевру" а то тут чорт голову вломить що де і як працює
        try {
            if (action === 'add') {
                await api.post('/friends/add', { username });
                alert("Заявку надіслано!");
            }
            else if (action === 'accept') {
                await api.post('/friends/accept', { username });
                setUsers(prev => prev.filter(u => u.username !== username));
            }
            else if (action === 'block') {
                if (!window.confirm(`Заблокувати @${username}?`)) return;
                await api.post('/friends/block', { username });
                setUsers(prev => prev.filter(u => u.username !== username));
            }
            else if (action === 'delete' || action === 'cancel_request') {
                if (action === 'delete' && !window.confirm(`Видалити @${username}?`)) return;
                await api.delete(`/friends/${username}`);
                setUsers(prev => prev.filter(u => u.username !== username));
            }
            else if (action === 'unblock') {
                await api.delete(`/friends/blocked/${username}`);
                setUsers(prev => prev.filter(u => u.username !== username));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Помилка виконання дії");
        }
    };

    const filteredUsers = users.filter(u => {
        if (activeTab === 'all') return true;
        if (u.id === currentUser?.id) return false;
        const search = searchQuery.toLowerCase();
        return (u.first_name + " " + u.last_name).toLowerCase().includes(search) ||
            u.username.toLowerCase().includes(search);
    });

    return (
        <div className="friends-container">
            <h2 style={{ marginBottom: 20 }}>Контакти</h2>

            <div className="tabs-header">
                {['my', 'requests', 'all', 'blocked'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'my' && 'Друзі'}
                        {tab === 'requests' && 'Заявки'}
                        {tab === 'all' && 'Пошук'}
                        {tab === 'blocked' && 'Чорний список'}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: 15 }}>
                <input
                    type="text"
                    placeholder="Швидкий пошук..."
                    className="input-field"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {loading && users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20 }}>Завантаження...</div>
            ) : (
                <div className="users-list">
                    {filteredUsers.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>Список порожній</div>
                    )}

                    {filteredUsers.map(u => (
                        <div key={u.id} className="user-row">
                            <Link to={`/${u.username}`}>
                                <img src={u.avatar || "/defaultAvatar.jpg"} alt={u.username} className="user-row-avatar" />
                            </Link>

                            <div className="user-row-info">
                                <Link to={`/${u.username}`} className="user-row-name">
                                    {u.first_name} {u.last_name}
                                </Link>
                                <div className="user-row-bio">@{u.username}</div>
                            </div>

                            <div className="user-row-actions">
                                {activeTab === 'my' && (
                                    <>
                                        <button className="btn-small" style={{ background: '#444', color: '#fff' }}>SMS</button>
                                        <button className="btn-small btn-remove" onClick={() => handleAction('delete', u.username)}>Видалити</button>
                                        <button className="btn-small btn-remove" onClick={() => handleAction('block', u.username)}>Block</button>
                                    </>
                                )}

                                {activeTab === 'requests' && (
                                    <>
                                        <button className="btn-small btn-add" onClick={() => handleAction('accept', u.username)}>Прийняти</button>
                                        <button className="btn-small btn-remove" onClick={() => handleAction('cancel_request', u.username)}>Відхилити</button>
                                    </>
                                )}

                                {activeTab === 'all' && (
                                    <button className="btn-small btn-add" onClick={() => handleAction('add', u.username)}>Додати</button>
                                )}

                                {activeTab === 'blocked' && (
                                    <button className="btn-small btn-add" onClick={() => handleAction('unblock', u.username)}>Розблокувати</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}