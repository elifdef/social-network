import { APP_NAME } from "../config";

function Footer() {
    return (
        <footer className="landing-footer">
            © 2025 - {new Date().getFullYear()} {APP_NAME}. Всі права не захищено.
        </footer>
    )
}
export default Footer; 