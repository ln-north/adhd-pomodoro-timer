import React, { useState, useEffect, useRef } from "react";

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
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // タイマーのリセット処理
    if (isShouldReset) {
      setCurrentTime(time);
      startTimeRef.current = null;
      elapsedTimeRef.current = 0;
    }
  }, [isShouldReset, time]);

  useEffect(() => {
    const updateTimer = () => {
      if (startTimeRef.current !== null) {
        const now = Date.now();
        const totalElapsed = elapsedTimeRef.current + (now - startTimeRef.current);
        const remainingTime = Math.max(time - Math.floor(totalElapsed / 1000), 0);
        setCurrentTime(remainingTime);

        if (remainingTime <= 0) {
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          onComplete();
        }
      }
    };

    if (isRunning && isSelected) {
      if (startTimeRef.current === null) {
        // タイマー開始または再開
        startTimeRef.current = Date.now();
      }
      // インターバルタイマーの設定
      if (!intervalIdRef.current) {
        intervalIdRef.current = setInterval(updateTimer, 50);
      }
    } else {
      // タイマー一時停止
      if (startTimeRef.current !== null) {
        const now = Date.now();
        elapsedTimeRef.current += now - startTimeRef.current;
        startTimeRef.current = null;
      }
      // インターバルタイマーのクリア
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    return () => {
      // クリーンアップ
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isRunning, isSelected, time, onComplete]);


  useEffect(() => {
    if (isShouldReset) {
      setCurrentTime(time);
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
