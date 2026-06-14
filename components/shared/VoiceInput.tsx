"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<"idle" | "listening" | "error">("idle");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const getRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const r = new SpeechRecognition();
    r.lang = "zh-CN";
    r.interimResults = true;
    r.continuous = true;

    r.onresult = (e: SpeechRecognitionEvent) => {
      let final = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (final) {
        onTranscript(final);
        setInterim("");
      } else {
        setInterim(interimText);
      }
    };

    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed") {
        setState("error");
      } else {
        setState("idle");
      }
    };

    r.onend = () => {
      setState("idle");
      setInterim("");
    };

    recognitionRef.current = r;
    return r;
  }, [onTranscript]);

  const start = useCallback(() => {
    if (state === "listening" || disabled) return;
    const r = getRecognition();
    if (!r) return;
    setState("listening");
    setInterim("");
    try {
      r.start();
    } catch {
      setState("idle");
    }
  }, [state, disabled, getRecognition]);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.stop();
    } catch {
      // already stopped
    }
  }, []);

  if (getRecognition() === null) return null;

  return (
    <div className="relative">
      {state === "listening" && interim && (
        <motion.div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap max-w-[200px] truncate"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {interim}
        </motion.div>
      )}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={(e) => {
          if (e.buttons > 0) stop();
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        aria-label="按住说话"
      >
        {state === "error" ? (
          <span className="text-red-400 text-xs">!</span>
        ) : (
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={state === "listening" ? "#ef4444" : "rgba(255,255,255,0.3)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={state === "listening" ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </motion.svg>
        )}
      </button>
    </div>
  );
}
