// SpeedControl.tsx
import React from "react";

interface SpeedControlProps {
  speed: number;
  onChange: (speed: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ speed, onChange }) => {
  const speeds = [0.5, 1, 1.25, 1.5, 2];

  return (
    <div
      className="speed-control"
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      <label htmlFor="speed-select">Speed:</label>
      <select
        id="speed-select"
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {speeds.map((s) => (
          <option key={s} value={s}>
            {s}x
          </option>
        ))}
      </select>
    </div>
  );
};

export default SpeedControl;
