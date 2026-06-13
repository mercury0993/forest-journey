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
  const initRef = useRef(false);

  // Restore saved preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("fj_audio_on");
    if (stored === "true") {
      setIsPlaying(true);
    }
    initRef.current = true;
  }, []);

  const startEngine = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = new ForestAudioEngine();
    }
    try {
      await engineRef.current.start();
    } catch {
      // Autoplay blocked or not supported — revert state
      setIsPlaying(false);
      localStorage.setItem("fj_audio_on", "false");
    }
  }, []);

  const stopEngine = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!initRef.current) return;
    if (isPlaying) {
      startEngine();
    } else {
      stopEngine();
    }
  }, [isPlaying, startEngine, stopEngine]);

  const toggle = useCallback(() => {
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
