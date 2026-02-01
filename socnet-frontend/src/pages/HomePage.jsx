import { usePageTitle } from "../hooks/usePageTitle";

export default function HomePage() {
    usePageTitle("Головна");
    return (
        <div style={{ padding: '20px' }}>
            <h2>Пости</h2>
            <p style={{ color: '#71767b' }}>Hello World!</p>
        </div>
    );
}