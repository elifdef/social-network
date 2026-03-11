import React, { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plyr } from "plyr-react";
import "plyr/dist/plyr.css";

const VideoPlayer = React.memo(function VideoPlayer({
    src,
    type = 'video/mp4',
    provider = 'html5',
    poster = '',
    className = ''
}) {
    const { t } = useTranslation();
    const wrapperRef = useRef(null);

    const plyrOptions = useMemo(() => ({
        controls: [
            'play-large', 'play', 'progress', 'current-time', 'duration',
            'mute', 'volume', 'settings', 'pip', 'fullscreen'
        ],
        settings: ['quality', 'speed', 'loop'],
        loop: { active: false },
        speed: { selected: 1, options: [0.5, 1, 1.25, 1.5, 2, 3, 4] },
        loadSprite: true,
        autopause: true,
        i18n: {
            restart: t('video.restart'),
            rewind: t('video.rewind'),
            play: t('video.play'),
            pause: t('video.pause'),
            fastForward: t('video.forward'),
            seek: t('video.seek'),
            played: t('video.played'),
            buffered: t('video.buffered'),
            currentTime: t('video.currentTime'),
            duration: t('video.duration'),
            volume: t('video.volume'),
            mute: t('video.mute'),
            unmute: t('video.unmute'),
            enableCaptions: t('video.enableCaptions'),
            disableCaptions: t('video.disableCaptions'),
            enterFullscreen: t('video.enterFullscreen'),
            exitFullscreen: t('video.exitFullscreen'),
            frameTitle: t('video.frameTitle'),
            captions: t('video.captions'),
            settings: t('video.settings'),
            speed: t('video.speed'),
            normal: t('video.normal'),
            quality: t('video.quality'),
            loop: t('video.loop'),
        }
    }), [t]);

    const plyrSource = useMemo(() => ({
        type: 'video',
        sources: [{
            src,
            provider,
            type: provider === 'youtube' ? undefined : type
        }],
        poster,
    }), [src, type, provider, poster]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        // якщо проскролити вниз то відео зупиняється
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        const videoElement = wrapper.querySelector('video');
                        if (videoElement && !videoElement.paused) videoElement.pause();

                        const iframeElement = wrapper.querySelector('iframe');
                        if (iframeElement) {
                            iframeElement.contentWindow.postMessage(JSON.stringify({
                                event: 'command',
                                func: 'pauseVideo'
                            }), '*');
                        }
                    }
                });
            },
            { threshold: 0.2 }
        );

        // при пробілі відео зупиняється
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();

                const videoElement = wrapper.querySelector('video');
                if (videoElement) {
                    videoElement.paused ? videoElement.play() : videoElement.pause();
                }
            }
        };

        wrapper.addEventListener('keydown', handleKeyDown);
        observer.observe(wrapper);

        return () => {
            wrapper.removeEventListener('keydown', handleKeyDown);
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={`socnet-video-player retro-2012-player ${className}`}
            tabIndex="0"
        >
            <Plyr
                source={plyrSource}
                options={plyrOptions}
            />
        </div>
    );
});

export default VideoPlayer;