import React, { useState, useEffect } from "react";

export interface TimerProps {
  time: number;
  label: string;
  isSelected: boolean;
  isRunning: boolean;
  isShouldReset: boolean;
  onComplete: () => void;
  size?: "medium" | "large"; // size プロパティを追加
}

export const Timer: React.FC<TimerProps> = ({
  time,
  label,
  isSelected,
  isRunning,
  isShouldReset,
  onComplete,
  size = "medium",
}) => {
  const [currentTime, setCurrentTime] = useState(time);
  const [timerId, setTimeId] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setCurrentTime((prevTime) => prevTime - 1);
      }, 1000);
      setTimeId(id);
    } else {
      clearInterval(timerId);
    }
  }, [isRunning]);

  useEffect(() => {
    if (currentTime === 0) {
      onComplete();
    }
  }, [currentTime]);

  useEffect(() => {
    if (isShouldReset) {
      setCurrentTime(time);
    }
  }, [isShouldReset]);

  // プログレスバーの計算
  const progressPercentage = 100 - (currentTime / time) * 100;

  return (
    <div
      className={`h-16 px-4 flex items-center justify-center rounded-lg transition-all duration-300 relative overflow-clip ${
        isSelected
          ? "bg-gray-50 outline outline-2 outline-indigo-500"
          : "bg-gray-50 opacity-50"
      }`}
    >
      <div className="flex justify-between items-center w-full z-10">
        <span
          className={`text-lg ${
            isSelected ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {label}
        </span>
        <span
          className={`text-lg ${
            isSelected ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {formatTime(currentTime)}
        </span>
      </div>
      <div
        className={`absolute top-0 left-0 h-full -lg transition-all duration-300 ${
          isSelected ? "bg-blue-200" : "bg-blue-100"
        }`}
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}時間`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}分`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}秒`);
  }

  return parts.join("");
}
