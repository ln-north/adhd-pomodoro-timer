"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "@/components/Timer";
import nextConfig from "../../next.config";
const BASE_PATH = nextConfig.basePath || "";

const isDebug = false;

const defaultTimes = [
  {
    time: isDebug ? 3 : 1 * 60,
    label: "やることを決める",
    sound: "bell.mp3",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    time: isDebug ? 2 : 13 * 60,
    label: "作業",
    sound: "completed.mp3",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    time: isDebug ? 2 : 1 * 60,
    label: "振り返り",
    sound: "bell.mp3",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    time: isDebug ? 2 : 5 * 60,
    label: "休憩",
    sound: "bell.mp3",
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isShouldReset, setIsShouldReset] = useState(false);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [timers, setTimers] = useState(defaultTimes);

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
      setCurrentTimerIndex((prevIndex) => prevIndex + 1);
      playSound(timers[currentTimerIndex].sound);
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

  const reset = () => {
    setIsRunning(false);
    setIsStarted(false);
    setCurrentTimerIndex(0);
    setTimers(defaultTimes.concat());
    setIsShouldReset(true);
  };

  useEffect(() => {
    [
      "start.mp3",
      "pause.mp3",
      "bell.mp3",
      "complete.mp3"
    ].map(s => preloadAudio(s))
  }, [])

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        isRunning
          ? timers[currentTimerIndex].gradient
          : "from-gray-400 to-gray-600"
      } flex items-center justify-center px-4`}
    >
      <div className="max-w-md w-full">
        <div className="space-y-4 mb-8">
          {timers.map((timer, index) => (
            <React.Fragment key={index}>
              <Timer
                time={timer.time}
                label={timer.label}
                isSelected={index === currentTimerIndex}
                isRunning={isRunning}
                isShouldReset={isShouldReset}
                onComplete={onComplete}
                onChangeTime={onChangeTime(index)}
              />
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4">
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
          </div>

          {/* <button
            onClick={reset}
            className="w-36 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            リセット
          </button> */}
        </div>
      </div>
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
  audio.preload = 'auto';
  audio.load();
  return audio;
};