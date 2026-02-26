import { useEffect, useState, useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import NotFoundPage from "./NotFoundPage";
import UserProfileCard from "../components/profile/UserProfileCard";
import UserWall from "../components/wall/UserWall";
import { usePageTitle } from "../hooks/usePageTitle";
import ErrorState from "../components/common/ErrorState";

export default function ProfilePage() {
    const { t } = useTranslation();
    const { username } = useParams();
    usePageTitle(username);

    const { user: authUser } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [notFound, setNotFound] = useState(false);
    const [serverError, setServerError] = useState(false);

    useEffect(() => {
        setNotFound(false);
        setServerError(false);
        setLoading(true);
        api.get(`/users/${username}`)
            .then(res => setProfile(res.data))
            .catch(err => {
                err.response && err.response.status === 404
                    ? setNotFound(true)
                    : setServerError(true);
            })
            .finally(() => setLoading(false));
    }, [username]);

    if (notFound)
        return <NotFoundPage />;

    if (serverError)
        return (
            <div style={{ padding: 20 }}>
                <ErrorState
                    title={t('error.connection')}
                    description={t('error.loading', { resource: t('common.profile').toLowerCase() })}
                />
            </div>
        );

    if (loading)
        return <div style={{ color: '#777', padding: 20, textAlign: 'center' }}>{t('common.loading')}</div>;

    if (!profile)
        return null;

    const isOwnProfile = authUser && authUser.username === profile.username;

    // якщо це МІЙ профіль і він НЕ готовий 
    if (isOwnProfile && !profile.is_setup_complete)
        return <Navigate to="/setup-profile" replace />;

    // якщо це ЧУЖИЙ профіль і він НЕ готовий 
    if (!profile.is_setup_complete)
        return (
            <div style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>
                <h2>{t('profile.not_setup')}</h2>
                <p>{t('profile.not_setup_desc', { name: profile.username })}</p>
            </div>
        );

    return (<>
        <UserProfileCard currentUser={profile} />
        {(profile.friendship_status !== "blocked_by_target" && !profile.is_banned) && (
            <UserWall profileUser={profile} isOwnProfile={isOwnProfile} />
        )}
    </>
    );
}