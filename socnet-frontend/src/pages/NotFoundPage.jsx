import { Link } from "react-router-dom";
import "../styles/old.css";
import notFound from "/notFound.svg"

const NotFoundPage = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <img src={notFound}/>
                <h1 className="not-found-title">Сторінку не знайдено</h1>
                <p className="not-found-text">
                    Можливо, ви перейшли за неправильним посиланням<br />
                    або сторінка була видалена.
                </p>

                <Link to="/" className="not-found-btn">
                    Повернутися на головну
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;