import React from "react";
import { Maximize, Minimize } from "lucide-react";

interface FullscreenButtonProps {
  onClick: () => void;
  isFullscreen: boolean;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  onClick,
  isFullscreen,
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 22,
      color: "#fff",
      padding: 4,
      marginLeft: 8,
      display: "flex",
      alignItems: "center",
    }}
  >
    {isFullscreen ? (
      <Minimize size={22} color="#fff" />
    ) : (
      <Maximize size={22} color="#fff" />
    )}
  </button>
);

export default FullscreenButton;
