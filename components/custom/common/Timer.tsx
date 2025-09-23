// components/custom/common/Timer.tsx
import React, { useState, useEffect } from "react";

// Define the interface for the Timer component's props
interface TimerProps {
  totalSeconds: number; // The total number of seconds for the countdown
  onTimeUp: () => void; // A callback function to run when the timer reaches zero
}

const Timer: React.FC<TimerProps> = ({ totalSeconds, onTimeUp }) => {
  // Use useState with explicit type argument for secondsLeft
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);

  // Calculate minutes and seconds from secondsLeft
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Determine the CSS class based on remaining time
  const timerColorClass = secondsLeft <= 60 ? "text-red-500 font-bold" : ""; // Example for Tailwind

  // Use useEffect to manage the timer interval
  useEffect(() => {
    // If time is up, call the onTimeUp callback and clear any interval
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    // Set up the interval to decrement secondsLeft every second
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or dependencies change
    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]); // Dependencies for useEffect: re-run if secondsLeft or onTimeUp changes

  return (
    <div className={`text-xl ${timerColorClass}`}>
      Time Left: {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
};

export default Timer;
