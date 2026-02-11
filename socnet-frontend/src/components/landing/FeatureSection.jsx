export default function FeatureSection({ title, description, imageAlt, isReversed, color }) {
    return (
        <section className={`info-block ${isReversed ? 'reverse' : ''}`}>
            <div className="info-text-container left">
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
            <div className="info-image-container right" style={{ backgroundColor: color }}>
                <div className="placeholder-image">
                    {imageAlt}
                </div>
            </div>
        </section>
    );
}