import Linkify from "linkify-react";
import "linkify-plugin-mention";
import { useState } from "react";
import PhotoModal from "../UI/PhotoModal";

const linkifyOptions = {
    target: "_blank",
    className: "socnet-link",
    formatHref: {
        mention: (href) => `/${href.substring(1)}`, // перетворює @teto на /teto
        url: (href) => href,
    },
    validate: {
        mention: (value) => value.substring(1).length >= 4 // якщо юзернейм invalid
    }
};

export default function PostContent({ content, post, onUpdate, className }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const attachments = post?.attachments || [];

    return (
        <>
            <div className={`socnet-post-content ${className || ''}`}>
                {/* текст */}
                {content && (
                    <p className="socnet-post-text">
                        <Linkify options={linkifyOptions}>{content}</Linkify>
                    </p>
                )}

                {/* галерея */}
                {attachments.length > 0 && (
                    <div className={`socnet-post-gallery ${attachments.length === 1 ? 'count-1' : 'count-more'}`}>
                        {attachments.map((media) => (
                            <img
                                key={media.id}
                                src={media.url}
                                alt="Attachment"
                                className="socnet-gallery-image"
                                onClick={() => setSelectedImage(media.url)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <PhotoModal
                    isOpen={!!selectedImage}
                    image={selectedImage}
                    post={post}
                    onClose={() => setSelectedImage(null)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
}