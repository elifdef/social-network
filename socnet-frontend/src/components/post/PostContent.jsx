import Linkify from "linkify-react";
import "linkify-plugin-mention";
import { useState } from "react";
import PhotoModal from "../UI/PhotoModal";

const linkifyOptions = {
    target: "_blank",
    className: "vk-link",
    formatHref: {
        mention: (href) => `/${href.substring(1)}`, // перетворює @teto на /teto
        url: (href) => href,
    },
};

export default function PostContent({ content, image, post, onUpdate, style }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="vk-post-content" style={style}>
                {content &&
                    <p className="vk-post-text">
                        <Linkify options={linkifyOptions}>{content}</Linkify>
                    </p>}

                {image && (
                    <div className="vk-post-image">
                        <img
                            src={image}
                            className="vk-post-image"
                            onClick={() => setIsModalOpen(true)}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                )}
            </div>

            {image && (
                <PhotoModal
                    isOpen={isModalOpen}
                    image={image}
                    post={post}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
}