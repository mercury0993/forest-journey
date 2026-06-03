"use client";

import { useAudio } from "@/context/AudioContext";

export default function AudioToggle() {
  const { isPlaying, toggle } = useAudio();

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg hover:bg-black/50 transition-colors"
      aria-label={isPlaying ? "关闭白噪音" : "开启白噪音"}
    >
      {isPlaying ? "🔊" : "🔇"}
    </button>
  );
}
