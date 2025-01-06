"use client";

import React, { useEffect, useRef, useState } from "react";
import { Timer } from "@/components/Timer";
import nextConfig from "../../next.config";
const BASE_PATH = nextConfig.basePath || "";

const isDebug = false;

const defaultTimers = [
  {
    time: isDebug ? 5 : 1 * 60,
    label: "タスク決め",
    type: "preparation",
    sound: "bell.mp3",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    time: isDebug ? 5 : 13 * 60,
    label: "作業",
    type: "working",
    sound: "completed.mp3",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    time: isDebug ? 5 : 1 * 60,
    label: "振り返り",
    type: "review",
    sound: "bell.mp3",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    time: isDebug ? 5 : 5 * 60,
    label: "休憩",
    type: "relaxing",
    sound: "bell.mp3",
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isShouldReset, setIsShouldReset] = useState(false);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [timers, setTimers] = useState(defaultTimers);
  const [logs, setLogs] = useState<
    { label: string; type: string; time: number; comment: string }[]
  >([]);
  const commentRef = useRef("");
  const [comment, setComment] = useState("");
  const [isShowLog, setIsShowLog] = useState(false);

  const start = () => {
    setIsRunning(true);
    setIsStarted(true);
    playSound("start.mp3");
  };

  const stop = () => {
    setIsRunning(false);
    playSound("pause.mp3");
  };

  const onComplete = () => {
  if (currentTimerIndex < timers.length - 1) {
    // 現在のタイマー情報を取得
    const completedTimer = timers[currentTimerIndex];

    // ログを更新
    setLogs((prevLogs) => [
      ...prevLogs,
      {
        label: completedTimer.label,
        type: completedTimer.type,
        time: completedTimer.time,
        comment: commentRef.current,
      },
    ]);

    // コメントをリセット
    setComment("");
    commentRef.current = "";

    // タイマーのインデックスを更新
    setCurrentTimerIndex((prevIndex) => prevIndex + 1);

    // サウンドを再生
    playSound(completedTimer.sound);

    if (isShouldReset) {
      setIsShouldReset(false);
    }
  } else {
    reset();
    start();
  }
};



  const onChangeTime = (index: number) => (time: number) => {
    setTimers((prevTimers) => {
      const updatedTimers = [...prevTimers];
      updatedTimers[index].time = time;
      return updatedTimers;
    });
  };

  const onChangeComment = (e: React.ChangeEvent<HTMLInputElement>) => {
    commentRef.current = e.target.value;
    setComment(e.target.value);
  };

  const reset = () => {
    setIsRunning(false);
    setIsStarted(false);
    setCurrentTimerIndex(0);
    setTimers(defaultTimers.concat());
    setIsShouldReset(true);
  };

  const getCommentPlaceholder = (index: number) => {
    if (timers[index].type === "preparation") {
      return "やることを入力";
    } else if (timers[index].type === "review") {
      return "振り返りを入力";
    } else {
      ("コメントを入力");
    }
  };

  useEffect(() => {
    console.log("comment", comment);
    console.log("commentRef.current", commentRef.current);
  }, [comment])

  useEffect(() => {
    ["start.mp3", "pause.mp3", "bell.mp3", "complete.mp3"].map((s) =>
      preloadAudio(s)
    );
  }, []);

  return (
    <div>
      <div
        className={`min-h-screen bg-gradient-to-br ${
          isRunning
            ? timers[currentTimerIndex].gradient
            : "from-gray-400 to-gray-600"
        } flex items-center justify-center px-4 ${
          isShowLog ? "filter blur-sm" : ""
        }`}
      >
        <div className="max-w-md w-full">
          <div className="space-y-4 mb-8">
            {timers.map((timer, index) => (
              <React.Fragment key={index}>
                <Timer
                  time={timer.time}
                  label={timer.label}
                  description={
                    index === currentTimerIndex
                      ? logs[logs.length - 1]?.comment
                      : undefined
                  }
                  isSelected={index === currentTimerIndex}
                  isRunning={isRunning}
                  isShouldReset={isShouldReset}
                  onComplete={onComplete}
                  onChangeTime={onChangeTime(index)}
                />
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="flex justify-center space-x-4">
              {!isRunning && (
                <button
                  onClick={start}
                  className="w-36 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  {isStarted ? "再開" : "スタート"}
                </button>
              )}
              {isRunning && (
                <button
                  onClick={stop}
                  className="w-36 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  一時停止
                </button>
              )}
              <button
                onClick={() => setIsShowLog(true)}
                className="w-36 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium"
              >
                ログを表示
              </button>
            </div>

            {/* <button
            onClick={reset}
            className="w-36 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            リセット
          </button> */}
          </div>

          <div className="flex flex-col items-center space-y-4">
            <input
              onInput={onChangeComment}
              value={comment}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={getCommentPlaceholder(currentTimerIndex)}
            />
          </div>
        </div>
      </div>
      {isShowLog && (
        <div className="fixed top-0 left-0 w-full h-full bg-opacity-75 bg-gray-900 flex flex-col items-center justify-center">
          <ul className="max-w-xs w-full">
            {logs.map((log, index) => (
              <li key={index} className="p-2 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="text-xs">
                    <span className="text-gray-50">{log.label}</span>
                    <span className="text-gray-300">
                      （{formatTime(log.time)}）
                    </span>
                    {log.comment && (
                      <span className="text-gray-50">：{log.comment}</span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-gray-50 text-xs">
            合計作業時間：
            {formatTime(
              logs.reduce(
                (acc, log) => (log.type === "working" ? acc + log.time : acc),
                0
              )
            )}
          </div>
          <button
            onClick={() => setIsShowLog(false)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200
              font-medium"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}

const playSound = (soundFile: string) => {
  const audio = new Audio(`${BASE_PATH}/sounds/${soundFile}`);
  audio.play().catch((error) => {
    console.warn("Audio playback failed:", error);
  });
};

const preloadAudio = (soundFile: string): HTMLAudioElement => {
  const audio = new Audio(`${BASE_PATH}/sounds/${soundFile}`);
  audio.preload = "auto";
  audio.load();
  return audio;
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
