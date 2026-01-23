import { useState } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config";
import api from "../api/axios";
import Footer from "../components/Footer";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    const [msg, setMsg] = useState({
        text: "",
        color: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({});

        try {
            await api.post('/sign-up', formData);
            setMsg({
                text: (
                    <span>
                        Ви успішно зареєструвались!{" "}
                        <Link to="/login" style={{ color: '#1d9bf0', textDecoration: 'underline' }}>Увійдіть тут</Link>
                    </span>
                ),
                color: "green"
            });
            setFormData({ username: "", email: "", password: "",password_confirmation: "" });
        } catch (err) {
            const errorText = err.response?.data?.message || "Помилка реєстрації";
            setMsg({ text: errorText, color: "red" });
        }
    };

    return (
        <>
            <div className="auth-container">
                <h1>Приєднуйся до {APP_NAME}</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        className="input-field" name="username" placeholder="Username"
                        value={formData.username} onChange={handleChange} required
                    />
                    <input
                        className="input-field" name="email" type="email" placeholder="Email"
                        value={formData.email} onChange={handleChange} required
                    />
                    <input
                        className="input-field" name="password" type="password" placeholder="Пароль"
                        value={formData.password} onChange={handleChange} required
                    />
                    <input
                        className="input-field" name="password_confirmation" type="password" placeholder="Підтвердіть пароль"
                        value={formData.password_confirmation} onChange={handleChange} required
                    />

                    {msg.text && <p style={{ color: msg.color, maxWidth: '300px', textAlign: 'center' }}>{msg.text}</p>}

                    <button className="btn">Зареєструватися</button>
                </form>
                <p>Вже є акаунт? <Link to="/login" style={{ color: '#1d9bf0' }}>Увійти</Link></p>
            </div>
            <Footer />
        </>
    );
}