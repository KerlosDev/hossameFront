'use client';
import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const VideoPlayer = ({ videoUrl }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const getYouTubeId = (url) => {
    const match = url?.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match?.[1] || null;
  };

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    if (typeof window !== 'undefined' && videoId && containerRef.current) {
      // Clear any previous player content
      containerRef.current.innerHTML = `
        <div id="player" data-plyr-provider="youtube" data-plyr-embed-id="${videoId}"></div>
      `;

      playerRef.current = new Plyr('#player', {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'settings',
          'fullscreen'
        ],
        settings: ['quality', 'speed'],
        youtube: {
          noCookie: false,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        }
      });
    }

    // Cleanup player instance
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white bg-black">
        رابط الفيديو غير صالح أو غير مدعوم
      </div>
    );
  }

  return (
    <div ref={containerRef} className="aspect-w-16 aspect-h-9" />
  );
};

export default VideoPlayer;
