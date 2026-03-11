import { useMemo } from 'react';

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;

export const usePostMedia = (content, attachments = [], entities = null) => {
    const localMedia = useMemo(() => {
        if (!attachments || attachments.length === 0) {
            return { images: [], videos: [], documents: [] };
        }
        return {
            images: attachments.filter(a => a.type === 'image'),
            videos: attachments.filter(a => a.type === 'video'),
            documents: attachments.filter(a => a.type !== 'image' && a.type !== 'video'),
        };
    }, [attachments]);

    const externalMedia = useMemo(() => {
        if (!content) return { youtube: [] };

        const youtubeLinks = [];
        let ytMatch;
        YOUTUBE_REGEX.lastIndex = 0;

        while ((ytMatch = YOUTUBE_REGEX.exec(content)) !== null) {
            youtubeLinks.push({
                id: `yt-${ytMatch[1]}`,
                url: ytMatch[0],
                videoId: ytMatch[1]
            });
        }

        let uniqueYouTube = Array.from(new Map(youtubeLinks.map(item => [item.videoId, item])).values());

        const removedList = (entities && Array.isArray(entities.removed_previews))
            ? entities.removed_previews
            : [];

        uniqueYouTube = uniqueYouTube.map(yt => ({
            ...yt,
            isRemoved: removedList.includes(yt.videoId)
        }));

        return { youtube: uniqueYouTube };
    }, [content, entities]);

    return { content, local: localMedia, external: externalMedia };
};