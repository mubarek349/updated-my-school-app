import React from "react";

interface ProgressBarProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  onSeek: (time: number) => void;
  buffered?: number; // in seconds
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  buffered = 0,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSeek(Number(e.target.value));
  };

  // Calculate buffered percent
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;
  const playedPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="progress-bar"
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
    >
      <span>{formatTime(currentTime)}</span>
      <div style={{ position: "relative", flex: 1, height: 8 }}>
        {/* Buffered bar (green, behind) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 3,
            height: 9,
            width: "100%",
            background: "#444", // background bar
            borderRadius: 2,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 3,
            height: 8,
            width: `${bufferedPercent}%`,
            background: "white",
            borderRadius: 2,
            zIndex: 1,
            opacity: 0.7,
          }}
        />
        {/* Played bar (blue, in front of buffered) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 3,
            height: 8,
            width: `${playedPercent}%`,
            background: "#0070f3",
            borderRadius: 2,
            zIndex: 2,
          }}
        />
        {/* Range input */}
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleChange}
          style={{
            width: "100%",
            background: "transparent",
            position: "relative",
            zIndex: 3,
            height: 0,
            margin: 0,
            padding: 0,
            cursor: "pointer",
            outline: "none",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;
