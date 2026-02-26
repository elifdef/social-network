export const AdminTabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="socnet-settings-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`socnet-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};