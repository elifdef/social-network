import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import isoCountries from "i18n-iso-countries";
import { useDateFormatter } from "../../hooks/useDateFormatter";

export default function ProfileInfo({ user, displayBirth, displayCountry, displayGender, showFriendsBlock }) {
    const { t, i18n } = useTranslation();
    const formatDate = useDateFormatter();
    const langCode = i18n.language || 'en';

    return (
        <>
            <div className="socnet-info-block">
                <h4 className="socnet-section-title">{t('profile.information')}</h4>
                <div className="socnet-info-row">
                    <div className="socnet-label">{t('common.birthday')}:</div>
                    <div className="socnet-value">
                        {user?.birth_date
                            ? formatDate(user.birth_date, { withTime: false, useRelative: false })
                            : displayBirth}
                    </div>
                </div>
                <div className="socnet-info-row">
                    <div className="socnet-label">{t('common.country')}:</div>
                    <div className="socnet-value">
                        {user?.country && user.country.length === 2 ? (
                            <span className="profile-country-wrapper">
                                <span className={`fi fi-${user.country.toLowerCase()}`}></span>
                                <span>{isoCountries.getName(user.country, langCode) || user.country}</span>
                            </span>
                        ) : (
                            displayCountry
                        )}
                    </div>
                </div>
                <div className="socnet-info-row">
                    <div className="socnet-label">{t('profile.joined')}:</div>
                    <div className="socnet-value">
                        {user?.created_at ? formatDate(user.created_at, { withTime: true, forceYear: true }) : ''}
                    </div>
                </div>
                <div className="socnet-info-row">
                    <div className="socnet-label">{t('common.gender')}:</div>
                    <div className="socnet-value">{displayGender}</div>
                </div>
            </div>

            {showFriendsBlock && (
                <div className="socnet-info-block">
                    <h4 className="socnet-section-title">{t('common.friends')}</h4>
                    <div className="socnet-info-row">
                        <div className="socnet-label">{t('common.friends')}</div>
                        <Link
                            to="/friends?tab=my"
                            className="socnet-value"
                        >
                            {user?.friends_count || 0}
                        </Link>
                    </div>
                    <div className="socnet-info-row">
                        <div className="socnet-label">{t('profile.subscribers')}</div>
                        <Link
                            to="/friends?tab=requests"
                            className="socnet-value"
                        >
                            {user?.followers_count || 0}
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}