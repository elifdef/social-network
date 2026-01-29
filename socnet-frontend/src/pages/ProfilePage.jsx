import { useEffect, useState, useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import api from "../api/axios";
import UserProfileCard from "../components/UserProfileCard";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
    const { username } = useParams();
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/users/${username}`)
            .then(res => setProfile(res.data.data))
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return <div style={{ color: 'white', padding: 20 }}>Завантаження...</div>;

    if (!profile) return <div style={{ color: 'red', padding: 20 }}>Користувача не знайдено</div>;

    const isOwnProfile = authUser && authUser.username === profile.username;

    // якщо це МІЙ профіль і він НЕ готовий 
    if (isOwnProfile && !profile.is_setup_complete)
        return <Navigate to="/setup-profile" replace />;

    // якщо це ЧУЖИЙ профіль і він НЕ готовий 
    if (!profile.is_setup_complete)
        return (
            <div style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>
                <h2>Профіль ще не налаштовано</h2>
                <p>Користувач @{profile.username} ще не заповнив інформацію про себе.</p>
            </div>
        );

    return (
        <div style={{ padding: '20px' }}>
            <UserProfileCard currentUser={profile} />
        </div>
    );
}