"use client";
import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, ChevronRight, ChevronLeft } from "lucide-react";
import Controls from "./Controls";
import Playlist from "./Playlist";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import FullscreenButton from "./FullScreen";
import { VideoItem } from "../../types";
import { cn } from "@/lib/utils";

interface PlayerProps {
  src: string;
  type?: "url" | "local";
  playlist?: VideoItem[];
  title?: string;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
}

export default function Player({
  src,
  type = "local",
  playlist = [],
  onVideoPlay,
  onVideoPause,
}: // title,
PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Compute the video source based on type
  let videoSrc = src;
  if (type === "url" && !src.startsWith("blob:")) {
    videoSrc = `/api/remote-stream?url=${encodeURIComponent(src)}`;
  } else if (type === "local") {
    videoSrc = `/api/stream?file=${encodeURIComponent(src)}`;
  }
  // For blob URLs (uploaded files), use src directly

  const currentSrc =
    playlist.length > 0 ? playlist[currentVideoIndex]?.url : videoSrc;

  // Detect mobile
  const isMobile =
    typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

  // Hide controls after a few seconds on mobile
  useEffect(() => {
    if (!isMobile || !showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 2500);
    return () => clearTimeout(timeout);
  }, [showControls, isMobile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("progress", updateBuffered);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("progress", updateBuffered);
    };
  }, [currentSrc]);



  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
  }, [speed, currentSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = muted;
    }
  }, [volume, muted]);

  // Fullscreen handlers
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    const video = videoRef.current;
    if (video) video.playbackRate = newSpeed;
  };

  const handleVolumeChange = (v: number) => setVolume(v);
  const handleMuteToggle = () => setMuted((m) => !m);

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = time;
    setCurrentTime(time);
  };

  const handleSelect = (idx: number) => {
    setCurrentVideoIndex(idx);
    setPlaying(false);
  };

  return (
    <div ref={containerRef} className="video-player">
      <div
        onMouseEnter={() => !isMobile && setShowControls(true)}
        onMouseLeave={() => !isMobile && setShowControls(false)}
        className={cn(
          "relative max-md:w-full",
          isFullscreen ? "md:w-full" : "md:w-[70%]"
        )}
      >
        <video
          ref={videoRef}
          src={currentSrc}
          width="100%"
          height="auto"
          style={{
            borderRadius: 8,
            width: "100%",
            // maxWidth: 640,
            display: "block",
          }}
          onPlay={(e) => {
            e.stopPropagation();
            setPlaying(true);
            onVideoPlay?.();
          }}
          onPause={(e) => {
            e.stopPropagation();
            setPlaying(false);
            onVideoPause?.();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isMobile) setShowControls((v) => !v);
          }}
        />

        {/* --- MOBILE CONTROLS --- */}
        {isMobile && showControls && (
          <>
            {/* Center Play/Pause, Skip Back, Skip Forward */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transform: "translateY(-50%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipTime(-10);
                }}
                style={{
                  pointerEvents: "auto",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#fff",
                  fontSize: 28,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  marginRight: 16,
                }}
                aria-label="Skip Backward"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                style={{
                  pointerEvents: "auto",
                  background: "rgba(0,0,0,0.7)",
                  border: "none",
                  color: "#fff",
                  fontSize: 32,
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  margin: "0 8px",
                }}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipTime(10);
                }}
                style={{
                  pointerEvents: "auto",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#fff",
                  fontSize: 28,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  marginLeft: 16,
                }}
                aria-label="Skip Forward"
              >
                <ChevronRight />
              </button>
            </div>
            {/* Volume at upper center right */}
            <div
              style={{
                position: "absolute",
                top: "30%",
                right: 8,
                transform: "translateY(-50%)",
                zIndex: 2,
                pointerEvents: "auto",
              }}
            >
              <VolumeControl
                volume={volume}
                muted={muted}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
              />
            </div>
            {/* Fullscreen at bottom right */}
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 16,
                zIndex: 2,
                pointerEvents: "auto",
              }}
            >
              <FullscreenButton
                onClick={handleFullscreen}
                isFullscreen={isFullscreen}
              />
            </div>
            {/* ProgressBar at bottom */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.4)",
                padding: "8px 0 0 0",
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                zIndex: 2,
              }}
            >
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                buffered={buffered}
              />
            </div>
          </>
        )}

        {/* --- DESKTOP CONTROLS --- */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              opacity: showControls ? 1 : 0,
              pointerEvents: showControls ? "auto" : "none",
              transition: "opacity 0.3s",
              background: "rgba(0,0,0,0.4)",
              padding: "12px 16px 8px 16px",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Progress bar at the top of controls */}
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              buffered={buffered}
            />
            {/* Controls row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginTop: 4,
              }}
            >
              {/* Left: Play/Pause, Skip Back, Skip Forward */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Controls
                  playing={playing}
                  onPlayPause={togglePlay}
                  onSkip={skipTime}
                  onSpeedChange={() =>
                    changeSpeed(speed >= 2 ? 1 : speed + 0.25)
                  }
                  speed={speed}
                  // currentTime={currentTime}
                  // duration={duration}
                  // onSeek={handleSeek}
                />
              </div>
              {/* Right: Volume, Speed, Fullscreen */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <VolumeControl
                  volume={volume}
                  muted={muted}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={handleMuteToggle}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeSpeed(speed >= 2 ? 1 : speed + 0.25);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 16,
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                  title="Change Speed"
                >
                  {speed}x
                </button>
                <FullscreenButton
                  onClick={handleFullscreen}
                  isFullscreen={isFullscreen}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {playlist.length > 0 && (
        <div style={{ width: "100%", maxWidth: 640, marginTop: 16 }}>
          <Playlist
            videos={playlist}
            currentVideoId={playlist[currentVideoIndex]?.id}
            onSelect={(_id) => {
              const idx = playlist.findIndex((v) => v.id === _id);
              if (idx !== -1) handleSelect(idx);
            }}
          />
        </div>
      )}
    </div>
  );
}
