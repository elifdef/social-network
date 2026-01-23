import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import UserProfileCard from "../components/UserProfileCard";

export default function ProfilePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/users/${username}`)
            .then(res => setProfile(res.data.data))
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return <div style={{ color: 'white', padding: 20 }}>Завантаження...</div>;
    if (!profile) return <div style={{ color: 'red', padding: 20 }}>Користувача не знайдено</div>;
    if(!profile.is_setup_complete) navigate('/setup-profile');
    return (
        <div style={{ padding: '20px' }}>
            <UserProfileCard currentUser={profile} />
        </div>
    );
}