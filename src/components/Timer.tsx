import React, { useState, useEffect } from "react";

export interface TimerProps {
  time: number; // タイマーの合計時間（秒）
  label: string;
  description?: string;
  isSelected: boolean;
  isRunning: boolean;
  isShouldReset: boolean;
  onComplete: () => void;
  onChangeTime: (time: number) => void;
}

export const Timer: React.FC<TimerProps> = ({
  time,
  label,
  description,
  isSelected,
  isRunning,
  isShouldReset,
  onComplete,
}) => {
  const [currentTime, setCurrentTime] = useState(time);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // 開始時間との差分で経過時間を計算し、表示を更新する
    const updateTimer = () => {
      if (startTime !== null && isRunning && isSelected) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const newTime = time - elapsedSeconds;

        setCurrentTime(newTime > 0 ? newTime : 0);

        // 終了
        if (newTime <= 0) {
          clearInterval(intervalId);
          onComplete();
          setStartTime(null);
        }
      }

      if (startTime === null) {
        setStartTime(Date.now());
      }
    };

    // タイマー起動時
    if (isRunning && isSelected) {
      updateTimer(); // 初回のイベント発火
      intervalId = setInterval(updateTimer, 10);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, isSelected, startTime]);

  useEffect(() => {
    if (isShouldReset) {
      setCurrentTime(time);
      setStartTime(null);
    }
  }, [isShouldReset, time]);

  // 編集可能かどうか
  const isEditable = isSelected && !isRunning && currentTime !== time;

  // プログレスバーの計算
  const progressPercentage = 100 - (currentTime / time) * 100;

  return (
    <div
      className={`h-16 px-4 flex items-center justify-center rounded-lg transition-all duration-300 relative overflow-clip bg-gray-50 ${
        !isSelected && isRunning ? "opacity-50" : ""
      } ${isSelected ? "outline outline-2 outline-indigo-500" : ""}`}
    >
      <div className="flex justify-between items-center w-full z-10">
        <div className="flex flex-col items-start">
          <span className="text-lg text-gray-700">{label}</span>
          {description && (
            <span className="text-xs text-gray-500">{description}</span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg text-gray-700">
            {formatTime(currentTime)}
          </span>
          {startTime && (
            <span className="text-xs text-gray-500">
              {formatStartTime(startTime)}
            </span>
          )}
        </div>
        {/* <button disabled={!isEditable}>編集</button> */}
      </div>
      <div
        className={`absolute top-0 left-0 h-full transition-all duration-300 ${
          isSelected ? "bg-blue-200" : "bg-blue-100"
        }`}
        style={{ width: `${progressPercentage}%` }}
      />
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

function formatStartTime(timestamp: number) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}時${minutes}分${seconds}秒`;
}
