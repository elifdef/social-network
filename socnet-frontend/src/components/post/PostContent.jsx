import { useState } from "react";
import Linkify from "linkify-react";
import "linkify-plugin-mention";
import { usePostMedia } from "../../hooks/usePostMedia";
import { formatFileSize } from "../../utils/upload";
import PhotoModal from "../UI/PhotoModal";
import VideoPlayer from "../UI/VideoPlayer";

import Mp3Icon from "../../assets/filetypes/mp3.svg?react";
import Mp4Icon from "../../assets/filetypes/mp3.svg?react";
import EpsteinIcon from "../../assets/filetypes/pdf.svg?react";
import RARIcon from "../../assets/filetypes/rar.svg?react";
import ZIPIcon from "../../assets/filetypes/zip.svg?react";
import DocIcon from "../../assets/filetypes/word.svg?react";
import DefaultFileIcon from "../../assets/filetypes/what.svg?react";

const linkifyOptions = {
    target: "_blank",
    className: "socnet-link",
    formatHref: {
        mention: (href) => `/${href.substring(1)}`,
        url: (href) => href,
    },
    validate: {
        mention: (value) => value.substring(1).length >= 4
    }
};

const getFileIcon = (fileName) => {
    if (!fileName) return <DefaultFileIcon width={64} height={64} />;
    const ext = fileName.split('.').pop().toLowerCase();

    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return <Mp3Icon width={64} height={64} />;
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return <Mp4Icon width={64} height={64} />;
    if (['pdf'].includes(ext)) return <EpsteinIcon width={64} height={64} />;
    if (['zip', '7z', 'tar', 'gz'].includes(ext)) return <ZIPIcon width={64} height={64} />;
    if (['rar'].includes(ext)) return <RARIcon width={64} height={64} />;
    if (['doc', 'docx'].includes(ext)) return <DocIcon width={64} height={64} />;

    return <DefaultFileIcon width={64} height={64} />;
};

export default function PostContent({ content: originalContent, post, onUpdate, className }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const { content, local, external } = usePostMedia(originalContent, post?.attachments, post?.entities);

    return (
        <>
            <div className={`socnet-post-content ${className || ''}`}>
                {/* текстовий контент */}
                {content && (
                    <p className="socnet-post-text">
                        <Linkify options={linkifyOptions}>{content}</Linkify>
                    </p>
                )}

                {/* галерея зображень */}
                {local.images.length > 0 && (
                    <div className={`socnet-post-gallery ${local.images.length === 1 ? 'count-1' : 'count-more'}`}>
                        {local.images.map((media) => (
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

                {/* відео (як завантажуване так і по силці ютуб) */}
                {(local.videos.length > 0 || external.youtube.length > 0) && (
                    <div className="socnet-post-videos-container">
                        {local.videos.map((video) => (
                            <VideoPlayer key={`loc-${video.id}`} src={video.url} />
                        ))}

                        {external.youtube.filter(yt => !yt.isRemoved).map((yt) => (
                            <VideoPlayer
                                key={yt.id}
                                src={yt.videoId}
                                provider="youtube"
                            />
                        ))}
                    </div>
                )}

                {/* прикріплені документи */}
                {local.documents.length > 0 && (
                    <div className="socnet-post-documents">
                        {local.documents.map((doc) => (
                            <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="socnet-document-item"
                                download={doc.original_name}
                            >
                                <div className="socnet-document-icon">
                                    {getFileIcon(doc.original_name)}
                                </div>
                                <div className="socnet-document-info">
                                    <span className="socnet-document-name" title={doc.original_name}>
                                        {doc.original_name || 'Document'}
                                    </span>
                                    <span className="socnet-document-size">
                                        {formatFileSize(doc.file_size)}
                                    </span>
                                </div>
                            </a>
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