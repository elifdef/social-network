import { useTranslation } from "react-i18next";
import { APP_NAME } from "../../config";

const StaffBanner = ({ userRole }) => {
    const { t } = useTranslation();
    const getRoleTitle = (role) => {
        switch (role) {
            case 1: return t('common.support');
            case 2: return t('common.moderator');
            case 3: return t('common.admin');
            default: return null;
        }
    };

    return (
        <div className="socnet-staff-top-banner">
            <div className="staff-banner-left">
                <span className="staff-name">{getRoleTitle(userRole)} {APP_NAME}</span>
                <span className="socnet-verified-badge" title={getRoleTitle(userRole)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#807a61" />
                    </svg>
                </span>
            </div>
        </div>
    );
};

export default StaffBanner;