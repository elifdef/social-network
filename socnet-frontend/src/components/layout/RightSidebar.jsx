import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { AuthContext } from "../../context/AuthContext";

const XD = () => (
    <div className="right-card">
        <h3>Yo dude</h3>
        <p>Check this
        <Link to="/post/jzfpnoicyrjalr9p" className="promo-btn">post</Link>and like it!</p>
    </div>
);

const JoinPromo = () => {
    const { t } = useTranslation();

    return (
        <div className="right-card">
            <h3>{t('sidebar.right.title')}</h3>
            <p>{t('sidebar.right.description')}</p>
            <Link to="/register" className="promo-btn">
                {t('sidebar.right.btn_text')}
            </Link>
        </div>
    );
};

const RightSidebar = () => {
    // це тимчасовий компонент який потрібен щоб чимось заповнити праву сторону екрана
    // тому він не несе в собі ніякого змісту і функціоналу 
    const { user } = useContext(AuthContext);

    return (
        <aside className="right-sidebar">
            {user ? <XD /> : <JoinPromo />}
        </aside>
    );
};

export default RightSidebar;