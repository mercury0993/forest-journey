"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { ForestAudioEngine } from "@/lib/audio-engine";

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
  const engineRef = useRef<ForestAudioEngine | null>(null);
  // 用户是否已主动交互过（解决 AudioContext 自动播放策略警告）
  const userInteractedRef = useRef(false);

  // 仅恢复偏好，不自动创建 AudioContext（避免浏览器警告）
  useEffect(() => {
    const stored = localStorage.getItem("fj_audio_on");
    if (stored === "true") {
      setIsPlaying(true);
    }
  }, []);

  const startEngine = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = new ForestAudioEngine();
    }
    try {
      await engineRef.current.start();
    } catch {
      setIsPlaying(false);
      localStorage.setItem("fj_audio_on", "false");
    }
  }, []);

  const stopEngine = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  // 仅在用户交互后才启动音频引擎
  useEffect(() => {
    if (!userInteractedRef.current) return;
    if (isPlaying) {
      startEngine();
    } else {
      stopEngine();
    }
  }, [isPlaying, startEngine, stopEngine]);

  const toggle = useCallback(() => {
    userInteractedRef.current = true;
    setIsPlaying((prev) => {
      const next = !prev;
      localStorage.setItem("fj_audio_on", String(next));
      return next;
    });
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, toggle }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
