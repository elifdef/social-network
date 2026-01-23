import { Link } from "react-router-dom";
import Footer from "../components/Footer"
import { APP_NAME } from "../config";

export default function MainPage() {
    return (
        <div className="landing-page-wrapper">
            <header className="landing-header">
                <h1 className="landing-title">Ласкаво просимо до {APP_NAME}</h1>
                <p className="landing-subtitle">Місце для твоїх думок та спілкування.</p>
            </header>

            <section className="info-block">
                <div className="info-image-container left">
                    <div className="placeholder-image placeholder-blue">Картинка 1</div>
                </div>
                <div className="info-text-container right">
                    <h2>Ділись моментами</h2>
                    <p>Публікуй свої думки, фотографії та ідеї. Знаходь однодумців та створюй свою стрічку новин.</p>
                </div>
            </section>

            <section className="info-block reverse">
                <div className="info-text-container left">
                    <h2>Будь на зв'язку</h2>
                    <p>Спілкуйся з друзями, коментуй дописи та обмінюйся повідомленнями в реальному часі.</p>
                </div>
                <div className="info-image-container right">
                    <div className="placeholder-image placeholder-purple">Картинка 2</div>
                </div>
            </section>

            <section className="cta-block">
                <div className="cta-content">
                    <h2>Готовий приєднатися?</h2>
                    <p>Створи акаунт зараз і стань частиною нашої спільноти.</p>

                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary-large">
                            Створити акаунт
                        </Link>
                        <Link to="/login" className="btn btn-outline-large">
                            Увійти
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}