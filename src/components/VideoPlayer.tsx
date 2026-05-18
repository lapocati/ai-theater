import { useState, useRef, useEffect, RefObject } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Settings, SkipForward, SkipBack, X } from 'lucide-react';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  onTimeUpdate: (time: number) => void;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  onFullscreenChange?: (isFullscreen: boolean) => void;
  isFullscreen?: boolean;
}

const VideoPlayer = ({ videoRef, onTimeUpdate, theme, onFullscreenChange, isFullscreen = false }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdateEvent = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdateEvent);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdateEvent);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume / 100;
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(70);
        videoRef.current.volume = 0.7;
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    if (onFullscreenChange) {
      onFullscreenChange(!isFullscreen);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl group transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
      style={{
        boxShadow: isFullscreen ? 'none' : `0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px ${theme.glow}`,
        background: '#000',
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isFullscreen && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-black"
        src="/zhenhuan.mp4"
        onClick={togglePlay}
      />

      {!isPlaying && currentTime === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-black/70 hover:bg-black/80"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/70"
            >
              <span className="text-2xl">🎬</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">甄嬛传</h1>
              <p className="text-gray-300 text-sm">第63集</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${theme.primary}40`, color: theme.accent }}
            >
              HD
            </span>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="mb-4">
          <div
            ref={progressRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
          >
            {isHoveringProgress && progressRef.current && (
              <div
                className="absolute bottom-full mb-2 px-3 py-1.5 rounded-lg text-xs text-white bg-black/80 backdrop-blur-sm"
                style={{
                  left: `${progress}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {formatTime(currentTime)}
              </div>
            )}

            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{
                  boxShadow: `0 0 20px ${theme.glow}`,
                }}
              />
            </div>

            <div
              className="absolute top-0 left-0 h-full bg-white/10 rounded-full"
              style={{ width: `${Math.min(progress + 20, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-300 mt-2 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={() => skipTime(-10)}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>

            <span className="text-gray-300 text-sm font-medium ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isFullscreen && (
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: `2px solid ${theme.primary}40`,
        }}
      />
    </div>
  );
};

export default VideoPlayer;
