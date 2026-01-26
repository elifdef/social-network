import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { APP_NAME } from "../config";
import Footer from "../components/Footer"
import FormInput from "../components/FormInput";

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
            const token = res.data.token;
            const res2 = await api.get('/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const user = res2.data;
            login(token, user);
            navigate(!user.is_setup_complete ? '/setup-profile' : '');
        } catch (err) {
            setError(err.response?.data?.message || "Помилка входу");
        }
    };

    return (
        <>
            <div className="auth-container">
                <h1>Вхід у {APP_NAME}</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormInput
                        type="email"
                        name="email"
                        className="input-field"
                        placeholder="Ел. пошта"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <FormInput
                        type="password"
                        name="password"
                        className="input-field"
                        placeholder="Пароль"
                        autoComplete="password"
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