# Voice Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add voice input to SceneAnimal's text fields using browser Web Speech API

**Architecture:** New `VoiceInput` component wraps `SpeechRecognition` API, exposes a press-and-hold microphone button. Integrated into SceneAnimal step 2 (textarea) and step 3 (input) as an inline icon right of the text field.

**Tech Stack:** Web Speech API (SpeechRecognition), React state, Framer Motion (pulse animation)

---

### Task 1: Create VoiceInput component

**Files:**
- Create: `components/shared/VoiceInput.tsx`

- [ ] **Step 1: Write VoiceInput component**

```tsx
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

  // Browser doesn't support SpeechRecognition
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
          // Only stop if button is still being pressed and pointer left
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
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/VoiceInput.tsx
git commit -m "feat: add VoiceInput component using Web Speech API

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Integrate VoiceInput into SceneAnimal

**Files:**
- Modify: `components/assessment/SceneAnimal.tsx`

- [ ] **Step 1: Add import**

Insert after line 5 (`import { ANIMAL_TAGS } from "@/lib/animals";`):

```tsx
import VoiceInput from "@/components/shared/VoiceInput";
```

- [ ] **Step 2: Modify textarea step (step "followUp1") — add VoiceInput**

Replace the textarea container (lines 100-110):

```tsx
      {step === "followUp1" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">它正在做什么？眼神是怎样的？</label>
          <div className="flex gap-2">
            <textarea
              value={followUp1}
              onChange={(e) => setFollowUp1(e.target.value)}
              placeholder="描述一下它的状态……"
              rows={3}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
              autoFocus
            />
            <div className="flex items-end pb-3">
              <VoiceInput onTranscript={(t) => setFollowUp1((prev) => (prev ? prev + t : t))} />
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 3: Modify input step (step "followUp2") — add VoiceInput**

Replace the input container (lines 113-128):

```tsx
      {step === "followUp2" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">它看到你了吗？你们有交流吗？</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={followUp2}
              onChange={(e) => setFollowUp2(e.target.value)}
              placeholder="（选填，按 Enter 跳过）"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNext();
              }}
            />
            <VoiceInput onTranscript={(t) => setFollowUp2((prev) => (prev ? prev + "，" + t : t))} />
          </div>
        </div>
      )}
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add components/assessment/SceneAnimal.tsx
git commit -m "feat: integrate voice input into SceneAnimal assessment flow

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Verification

- [ ] **Step 1: Run tests**

```bash
npx vitest run
```
Expected: 17/17 pass

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000/assessment`:
- [ ] Step 2 (textarea) shows mic icon on the right
- [ ] Step 3 (input) shows mic icon on the right
- [ ] Long-press mic → red pulse animation
- [ ] Speak in Chinese → text appears in field
- [ ] Release → text appended, not overwritten

- [ ] **Step 3: Commit final verification**

```bash
git add PROJECT_STATUS.md
git commit -m "docs: log voice input completion in project status

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Update project status

- [ ] **Step 1: Update PROJECT_STATUS.md**

Add Phase 17 entry and update 下一步 table (remove voice input item).

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```
