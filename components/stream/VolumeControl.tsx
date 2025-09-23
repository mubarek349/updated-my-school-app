import React from "react";
import { Volume, VolumeOff } from "lucide-react";

interface VolumeControlProps {
  volume: number; // 0 to 1
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
}) => {
  const isMobile =
    typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div
      className="volume-control"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMuteToggle();
        }}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {muted || volume === 0 ? (
          <VolumeOff size={20} color="red" />
        ) : (
          <Volume size={20} color="green" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        onChange={(e) => {
          e.stopPropagation();
          onVolumeChange(Number(e.target.value));
        }}
        style={{
          width: isMobile ? 60 : 80,
          height: isMobile ? 80 : "auto",
          transform: isMobile ? "rotate(-90deg)" : "none",
          transformOrigin: "center",
        }}
      />
    </div>
  );
};

export default VolumeControl;
