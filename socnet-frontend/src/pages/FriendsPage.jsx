import Input from "../components/UI/Input";
import FriendCard from "../components/friends/FriendCard";
import { useFriendsLogic } from "../hooks/useFriendsLogic";

export default function FriendsPage() {
    const {
        tabs, activeTab, handleTabChange,
        searchQuery, setSearchQuery, handleSearchSubmit,
        users, loading, handleAction, t
    } = useFriendsLogic();

    const displayUsers = activeTab === 'all'
        ? users
        : users.filter(u =>
            (u.first_name + " " + u.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="socnet-friends-page">
            <h1 className="socnet-friends-title">{t('friends.your_contacts')}</h1>
            <div className="socnet-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`socnet-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="socnet-friends-search-wrapper">
                <Input
                    placeholder={activeTab === 'all' ? t('friends.search_people') : t('friends.list_filter')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && activeTab === 'all' && handleSearchSubmit()}
                    className="socnet-form-input"
                />
                {activeTab === 'all' && (
                    <button className="socnet-friends-search-btn" onClick={handleSearchSubmit}>
                        {t('common.find')}
                    </button>
                )}
            </div>

            <div className="socnet-friends-list">
                {loading ? (
                    <div className="socnet-empty-state">{t('common.loading')}</div>
                ) : (
                    <>
                        {displayUsers.length === 0 && (
                            <div className="socnet-empty-state">
                                {t('friends.list_empty')}
                            </div>
                        )}

                        {displayUsers.map(user => (
                            <FriendCard
                                key={user.id}
                                user={user}
                                viewMode={activeTab}
                                onAction={handleAction}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}