import toast from "react-hot-toast";

const SecuritySettings = () => {
    return (
        <div className="settings-form">
            <div className="info-box">
                <strong>Зміна паролю</strong>
                <p style={{ margin: '5px 0 0' }}>Цей функціонал ще в розробці.</p>
            </div>
            
            <div className="danger-zone">
                <div className="danger-header">Danger Zone</div>
                <div className="danger-body">
                    <div>
                        <h4 style={{ margin: '0 0 5px' }}>Видалити акаунт</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            Після видалення акаунту шляху назад немає.
                        </p>
                    </div>
                    <button className="btn-delete" onClick={() => toast('В розробці')}>
                        Видалити акаунт
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;