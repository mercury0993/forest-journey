"use client";

import { useAudio } from "@/context/AudioContext";
import { useRef, useEffect } from "react";

export default function ForestLayout({ children }: { children: React.ReactNode }) {
  const { isPlaying } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/forest-ambient.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked or file missing — silently ignore
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#061206] text-white relative">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50" />
      {children}
    </div>
  );
}
