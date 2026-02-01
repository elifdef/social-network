const RightSidebar = () => {
    // це тимчасовий компонент який потрібен щоб чимось заповнити праву сторону екрана
    // тому він не несе в собі ніякого змісту і функціоналу 
    return (
        <div className="right-sidebar">
            <div style={{
                background: '#202327',
                borderRadius: '16px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Продам гараж</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#71767b' }}>
                    Бита не крашена
                </p>
                <button style={{
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '5px'
                }}>
                    Купити за ціну бюджета Естонії
                </button>
            </div>
        </div>
    );
};

export default RightSidebar;