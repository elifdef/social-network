import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { APP_NAME } from "../config";
import Footer from "../components/Footer"

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/sign-in', { email, password });
            login(res.data.token, res.data.user);
            const token = res.data.token;
            const res2 = await api.get('/me', { token });
            if (!res2.data.user.is_setup_complete) {
                navigate('/setup-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Помилка входу");
        }
    };

    return (
        <>
            <div className="auth-container">
                <h1>Вхід у {APP_NAME}</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        className="input-field"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        className="input-field"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button className="btn">Увійти</button>
                </form>
                <p>Немає акаунту? <Link to="/register" style={{ color: '#1d9bf0' }}>Реєстрація</Link></p>
            </div>
            <Footer />
        </>
    );
}