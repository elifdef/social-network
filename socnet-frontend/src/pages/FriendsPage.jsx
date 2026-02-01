import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useFriendsPageLogic } from "../hooks/useFriendsPageLogic";
import "../styles/Friends.css";

export default function FriendsPage() {
    const {
        tabs,
        activeTab,
        handleTabChange,
        searchQuery,
        setSearchQuery,
        loading,
        filteredUsers,
        handleAction
    } = useFriendsPageLogic();

    const renderButtons = (u) => {
        const btnClass = "btn-small";

        if (activeTab === 'my')
            return (
                <>
                    <button
                        className={`${btnClass} btn-remove`}
                        onClick={() => handleAction('delete', u.username)}>
                        Видалити
                    </button>
                    <button
                        className={`${btnClass} btn-remove`}
                        onClick={() => handleAction('block', u.username)}>
                        Заблокувати
                    </button>
                </>
            );

        if (activeTab === 'requests')
            return (
                <>
                    <button
                        className={`${btnClass} btn-add`}
                        onClick={() => handleAction('accept', u.username)}>
                        Прийняти
                    </button>
                    <button
                        className={`${btnClass} btn-remove`}
                        onClick={() => handleAction('cancel_request', u.username)}>
                        Відхилити
                    </button>
                </>
            );

        if (activeTab === 'subscriptions')
            return (
                <button
                    className={`${btnClass} btn-remove`}
                    onClick={() => handleAction('cancel_request', u.username)}>
                    Скасувати заявку
                </button>
            );

        if (activeTab === 'blocked')
            return (
                <button
                    className={`${btnClass} btn-add`}
                    onClick={() => handleAction('unblock', u.username)}>
                    Розблокувати
                </button>
            );

        const status = u.friendship_status || 'none';
        switch (status) {
            case 'friends':
                return renderButtons({ ...u }, 'my');

            case 'pending_sent':
                return (
                    <button
                        className={`${btnClass} btn-remove`}
                        onClick={() => handleAction('cancel_request', u.username)}>
                        Скасувати
                    </button>
                );

            case 'pending_received':
                return (
                    <button
                        className={`${btnClass} btn-add`}
                        onClick={() => handleAction('accept', u.username)}>
                        Прийняти
                    </button>
                );

            case 'blocked_by_me':
                return (
                    <button
                        className={`${btnClass} btn-add`}
                        onClick={() => handleAction('unblock', u.username)}>
                        Розблокувати
                    </button>
                );

            case 'blocked_by_target':
                return (
                    <span style={{ fontSize: '12px', color: '#777' }}>
                        Заблоковано
                    </span>
                );

            default:
                return (
                    <button
                        className={`${btnClass} btn-add`}
                        onClick={() => handleAction('add', u.username)}>
                        Додати
                    </button>
                );
        }
    };

    return (
        <div className="friends-container">
            <h2 style={{ marginBottom: 20 }}>Контакти</h2>
            <div className="tabs-header">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: 15 }}>
                <FormInput
                    type="text"
                    placeholder="Швидкий пошук..."
                    className="input-field"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {loading && filteredUsers.length === 0 ? (
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
                                {renderButtons(u)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}