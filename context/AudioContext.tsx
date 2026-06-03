"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AudioContextType {
  isPlaying: boolean;
  toggle: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  toggle: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fj_audio_on");
    if (stored !== null) {
      setIsPlaying(stored === "true");
    }
  }, []);

  const toggle = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      localStorage.setItem("fj_audio_on", String(next));
      return next;
    });
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggle }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
