# Animal SVG Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace emoji animal rendering with 26 flat-vector SVG animal components across result page, share card, and history list.

**Architecture:** New `components/animals/` directory with 26 standalone SVG React components organized by 6 body families, shared face feature components (eyes, nose), an `index.ts` barrel exporting `AnimalIcon` lookup wrapper, and minimal changes to 3 consumer components.

**Tech Stack:** React + TypeScript + inline SVG (no external deps)

---

### Task 1: Create directory structure and shared face components

**Files:**
- Create: `components/animals/shared/face/EyesRound.tsx`
- Create: `components/animals/shared/face/EyesAlmond.tsx`
- Create: `components/animals/shared/face/NoseSmall.tsx`
- Create: `components/animals/shared/face/NoseSnout.tsx`

- [ ] **Step 1: Create EyesRound.tsx**

```tsx
import React from "react";

interface Props {
  cx: number;
  cy: number;
  spacing: number;
}

export default function EyesRound({ cx, cy, spacing }: Props) {
  const r = 3.5;
  return (
    <g>
      <circle cx={cx - spacing} cy={cy} r={r} fill="#3a1a00" />
      <circle cx={cx + spacing} cy={cy} r={r} fill="#3a1a00" />
      <circle cx={cx - spacing + 1} cy={cy - 1} r={1.2} fill="#fff" />
      <circle cx={cx + spacing + 1} cy={cy - 1} r={1.2} fill="#fff" />
    </g>
  );
}
```

- [ ] **Step 2: Create EyesAlmond.tsx**

```tsx
import React from "react";

interface Props {
  cx: number;
  cy: number;
  spacing: number;
}

export default function EyesAlmond({ cx, cy, spacing }: Props) {
  return (
    <g>
      <ellipse cx={cx - spacing} cy={cy} rx={4} ry={3} fill="#3a1a00" />
      <ellipse cx={cx + spacing} cy={cy} rx={4} ry={3} fill="#3a1a00" />
      <ellipse cx={cx - spacing + 0.5} cy={cy - 1} rx={1.5} ry={1} fill="#fff" />
      <ellipse cx={cx + spacing + 0.5} cy={cy - 1} rx={1.5} ry={1} fill="#fff" />
    </g>
  );
}
```

- [ ] **Step 3: Create NoseSmall.tsx**

```tsx
import React from "react";

interface Props {
  cx: number;
  cy: number;
}

export default function NoseSmall({ cx, cy }: Props) {
  return <ellipse cx={cx} cy={cy} rx={3} ry={2.5} fill="#3a1a00" />;
}
```

- [ ] **Step 4: Create NoseSnout.tsx**

```tsx
import React from "react";

interface Props {
  cx: number;
  cy: number;
}

export default function NoseSnout({ cx, cy }: Props) {
  return <ellipse cx={cx} cy={cy} rx={4.5} ry={3.5} fill="#2d1b0e" />;
}
```

- [ ] **Step 5: Commit**

```bash
git add components/animals/shared/
git commit -m "feat: add shared animal face components"
```

---

### Task 2: Canine family — Fox, Wolf, Dog

**Files:**
- Create: `components/animals/FoxSvg.tsx`
- Create: `components/animals/WolfSvg.tsx`
- Create: `components/animals/DogSvg.tsx`

- [ ] **Step 1: Create FoxSvg.tsx**

```tsx
import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function FoxSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <ellipse cx="82" cy="82" rx="22" ry="12" fill="#e8783a" transform="rotate(-15,82,82)" />
      <ellipse cx="90" cy="80" rx="14" ry="8" fill="#fff5e6" transform="rotate(-15,90,80)" />
      {/* Body */}
      <ellipse cx="58" cy="72" rx="20" ry="16" fill="#e8783a" />
      <ellipse cx="58" cy="66" rx="14" ry="10" fill="#fff5e6" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="22" ry="18" fill="#e8783a" />
      {/* Ears */}
      <polygon points="38,32 30,12 48,26" fill="#e8783a" />
      <polygon points="38,30 34,16 46,28" fill="#fff5e6" />
      <polygon points="70,32 78,12 60,26" fill="#e8783a" />
      <polygon points="70,30 74,16 62,28" fill="#fff5e6" />
      {/* Cheeks */}
      <ellipse cx="38" cy="48" rx="8" ry="6" fill="#fff5e6" />
      <ellipse cx="70" cy="48" rx="8" ry="6" fill="#fff5e6" />
      {/* Eyes */}
      <EyesAlmond cx={54} cy={42} spacing={10} />
      {/* Nose */}
      <NoseSmall cx={54} cy={50} />
      {/* Mouth */}
      <path d="M48,54 Q54,58 60,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 2: Create WolfSvg.tsx**

```tsx
import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function WolfSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <ellipse cx="82" cy="80" rx="20" ry="10" fill="#6b6b7b" transform="rotate(-10,82,80)" />
      {/* Body */}
      <ellipse cx="58" cy="72" rx="20" ry="16" fill="#6b6b7b" />
      <ellipse cx="58" cy="66" rx="14" ry="10" fill="#9b9bab" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="22" ry="18" fill="#6b6b7b" />
      {/* Ears — pointed upright */}
      <polygon points="38,32 32,10 48,28" fill="#6b6b7b" />
      <polygon points="38,30 36,14 46,28" fill="#9b9bab" />
      <polygon points="70,32 76,10 60,28" fill="#6b6b7b" />
      <polygon points="70,30 72,14 62,28" fill="#9b9bab" />
      {/* Cheeks */}
      <ellipse cx="38" cy="48" rx="7" ry="5.5" fill="#9b9bab" />
      <ellipse cx="70" cy="48" rx="7" ry="5.5" fill="#9b9bab" />
      {/* Eyes */}
      <EyesAlmond cx={54} cy={42} spacing={9} />
      {/* Nose */}
      <NoseSmall cx={54} cy={50} />
      {/* Mouth */}
      <path d="M47,54 Q54,59 61,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 3: Create DogSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function DogSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <ellipse cx="80" cy="78" rx="16" ry="8" fill="#c08850" transform="rotate(-20,80,78)" />
      {/* Body */}
      <ellipse cx="58" cy="72" rx="20" ry="16" fill="#c08850" />
      <ellipse cx="58" cy="66" rx="14" ry="10" fill="#e8d0b0" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="20" ry="19" fill="#c08850" />
      {/* Floppy ears */}
      <ellipse cx="32" cy="40" rx="8" ry="14" fill="#a06830" transform="rotate(10,32,40)" />
      <ellipse cx="76" cy="40" rx="8" ry="14" fill="#a06830" transform="rotate(-10,76,40)" />
      {/* Snout */}
      <ellipse cx="54" cy="50" rx="10" ry="7" fill="#e8d0b0" />
      {/* Eyes */}
      <EyesRound cx={54} cy={40} spacing={9} />
      {/* Nose */}
      <NoseSnout cx={54} cy={48} />
      {/* Mouth */}
      <path d="M46,54 Q54,60 62,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
      <path d="M54,48 L54,60" fill="none" stroke="#3a1a00" strokeWidth="0.8" />
    </svg>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/animals/FoxSvg.tsx components/animals/WolfSvg.tsx components/animals/DogSvg.tsx
git commit -m "feat: add canine family SVG animals (fox, wolf, dog)"
```

---

### Task 3: Feline family — Cat, Tiger, Lion

**Files:**
- Create: `components/animals/CatSvg.tsx`
- Create: `components/animals/TigerSvg.tsx`
- Create: `components/animals/LionSvg.tsx`

- [ ] **Step 1: Create CatSvg.tsx**

```tsx
import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function CatSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <path d="M76,74 Q92,60 88,48" fill="none" stroke="#808080" strokeWidth="6" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="58" cy="70" rx="18" ry="15" fill="#808080" />
      <ellipse cx="58" cy="64" rx="12" ry="9" fill="#b0b0b0" />
      {/* Head */}
      <ellipse cx="56" cy="44" rx="20" ry="18" fill="#808080" />
      {/* Ears — triangles */}
      <polygon points="38,32 34,14 48,28" fill="#808080" />
      <polygon points="38,30 36,18 46,28" fill="#e8c0c0" />
      <polygon points="74,32 78,14 64,28" fill="#808080" />
      <polygon points="74,30 76,18 66,28" fill="#e8c0c0" />
      {/* Cheeks */}
      <ellipse cx="40" cy="48" rx="7" ry="5" fill="#b0b0b0" />
      <ellipse cx="72" cy="48" rx="7" ry="5" fill="#b0b0b0" />
      {/* Eyes */}
      <EyesAlmond cx={56} cy={42} spacing={10} />
      {/* Nose */}
      <NoseSmall cx={56} cy={50} />
      {/* Mouth */}
      <path d="M50,54 Q56,58 62,54" fill="none" stroke="#3a1a00" strokeWidth="1" />
      {/* Whiskers */}
      <line x1="30" y1="48" x2="42" y2="50" stroke="#ccc" strokeWidth="0.5" />
      <line x1="30" y1="52" x2="42" y2="52" stroke="#ccc" strokeWidth="0.5" />
      <line x1="82" y1="48" x2="70" y2="50" stroke="#ccc" strokeWidth="0.5" />
      <line x1="82" y1="52" x2="70" y2="52" stroke="#ccc" strokeWidth="0.5" />
    </svg>
  );
}
```

- [ ] **Step 2: Create TigerSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function TigerSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <path d="M78,74 Q96,58 94,44" fill="none" stroke="#e8783a" strokeWidth="7" strokeLinecap="round" />
      <path d="M78,74 Q96,58 94,44" fill="none" stroke="#3a1a00" strokeWidth="7" strokeLinecap="round" strokeDasharray="2,8" />
      {/* Body */}
      <ellipse cx="58" cy="70" rx="20" ry="16" fill="#e8783a" />
      <ellipse cx="58" cy="64" rx="14" ry="10" fill="#fff5e6" />
      {/* Stripes on body */}
      <path d="M44,68 L50,64" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52,72 L54,66" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62,72 L60,66" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="56" cy="44" rx="22" ry="19" fill="#e8783a" />
      {/* Ears */}
      <ellipse cx="36" cy="30" rx="7" ry="8" fill="#e8783a" />
      <ellipse cx="36" cy="30" rx="4" ry="5" fill="#fff5e6" />
      <ellipse cx="76" cy="30" rx="7" ry="8" fill="#e8783a" />
      <ellipse cx="76" cy="30" rx="4" ry="5" fill="#fff5e6" />
      {/* Forehead stripes */}
      <path d="M52,28 L56,36 L60,28" fill="none" stroke="#3a1a00" strokeWidth="2" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="38" cy="48" rx="9" ry="7" fill="#fff5e6" />
      <ellipse cx="74" cy="48" rx="9" ry="7" fill="#fff5e6" />
      {/* Eyes */}
      <EyesRound cx={56} cy={42} spacing={11} />
      {/* Nose */}
      <NoseSmall cx={56} cy={50} />
      {/* Mouth */}
      <path d="M49,54 Q56,59 63,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 3: Create LionSvg.tsx**

```tsx
import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function LionSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail tuft */}
      <ellipse cx="88" cy="78" rx="8" ry="6" fill="#8b5e3c" />
      {/* Body */}
      <ellipse cx="56" cy="72" rx="20" ry="16" fill="#c08850" />
      <ellipse cx="56" cy="66" rx="14" ry="10" fill="#e8d0b0" />
      {/* Mane */}
      <ellipse cx="54" cy="42" rx="28" ry="26" fill="#c08850" />
      <ellipse cx="54" cy="42" rx="28" ry="26" fill="#8b5e3c" opacity="0.3" />
      {/* Head */}
      <ellipse cx="54" cy="42" rx="18" ry="17" fill="#d4a060" />
      {/* Ears */}
      <ellipse cx="36" cy="28" rx="6" ry="7" fill="#d4a060" />
      <ellipse cx="72" cy="28" rx="6" ry="7" fill="#d4a060" />
      {/* Cheeks */}
      <ellipse cx="40" cy="46" rx="7" ry="5.5" fill="#e8d0b0" />
      <ellipse cx="68" cy="46" rx="7" ry="5.5" fill="#e8d0b0" />
      {/* Eyes */}
      <EyesAlmond cx={54} cy={40} spacing={9} />
      {/* Nose */}
      <NoseSnout cx={54} cy={48} />
      {/* Mouth */}
      <path d="M47,52 Q54,57 61,52" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/animals/CatSvg.tsx components/animals/TigerSvg.tsx components/animals/LionSvg.tsx
git commit -m "feat: add feline family SVG animals (cat, tiger, lion)"
```

---

### Task 4: Bear family — Bear, Panda

**Files:**
- Create: `components/animals/BearSvg.tsx`
- Create: `components/animals/PandaSvg.tsx`

- [ ] **Step 1: Create BearSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function BearSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — big and round */}
      <ellipse cx="58" cy="74" rx="24" ry="20" fill="#8b5e3c" />
      <ellipse cx="58" cy="66" rx="16" ry="11" fill="#c09870" />
      {/* Head */}
      <ellipse cx="56" cy="42" rx="24" ry="20" fill="#8b5e3c" />
      {/* Ears — small round */}
      <circle cx="36" cy="26" r="8" fill="#8b5e3c" />
      <circle cx="36" cy="26" r="4.5" fill="#c09870" />
      <circle cx="76" cy="26" r="8" fill="#8b5e3c" />
      <circle cx="76" cy="26" r="4.5" fill="#c09870" />
      {/* Snout */}
      <ellipse cx="56" cy="48" rx="11" ry="8" fill="#c09870" />
      {/* Eyes */}
      <EyesRound cx={56} cy={40} spacing={10} />
      {/* Nose */}
      <NoseSnout cx={56} cy={46} />
      {/* Mouth */}
      <path d="M49,52 Q56,57 63,52" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 2: Create PandaSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function PandaSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="74" rx="22" ry="19" fill="#fff" />
      <ellipse cx="58" cy="66" rx="15" ry="10" fill="#fff" />
      {/* Head */}
      <ellipse cx="56" cy="42" rx="24" ry="20" fill="#fff" />
      {/* Ears */}
      <circle cx="36" cy="26" r="8" fill="#2d2d2d" />
      <circle cx="76" cy="26" r="8" fill="#2d2d2d" />
      {/* Eye patches */}
      <ellipse cx="44" cy="40" rx="8" ry="7" fill="#2d2d2d" transform="rotate(-10,44,40)" />
      <ellipse cx="68" cy="40" rx="8" ry="7" fill="#2d2d2d" transform="rotate(10,68,40)" />
      {/* Eyes (white on dark patch) */}
      <circle cx="44" cy="40" r="3.5" fill="#fff" />
      <circle cx="68" cy="40" r="3.5" fill="#fff" />
      <circle cx="44" cy="40" r="2" fill="#1a1a1a" />
      <circle cx="68" cy="40" r="2" fill="#1a1a1a" />
      {/* Snout */}
      <ellipse cx="56" cy="50" rx="10" ry="7" fill="#e8e8e8" />
      {/* Nose */}
      <NoseSnout cx={56} cy={48} />
      {/* Mouth */}
      <path d="M50,53 Q56,57 62,53" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/animals/BearSvg.tsx components/animals/PandaSvg.tsx
git commit -m "feat: add bear family SVG animals (bear, panda)"
```

---

### Task 5: Ungulate family — Deer, Sheep, Goat, Horse, Cow

**Files:**
- Create: `components/animals/DeerSvg.tsx`
- Create: `components/animals/SheepSvg.tsx`
- Create: `components/animals/GoatSvg.tsx`
- Create: `components/animals/HorseSvg.tsx`
- Create: `components/animals/CowSvg.tsx`

- [ ] **Step 1: Create DeerSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function DeerSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="74" rx="18" ry="15" fill="#c08850" />
      <ellipse cx="58" cy="68" rx="11" ry="8" fill="#e8d0b0" />
      {/* Neck */}
      <rect x="50" y="34" width="16" height="24" rx="8" fill="#c08850" />
      {/* Head */}
      <ellipse cx="58" cy="34" rx="14" ry="11" fill="#c08850" />
      {/* Antlers */}
      <path d="M48,26 L42,12 L46,8 L50,18 L54,6 L56,18" fill="none" stroke="#6b4b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M68,26 L74,12 L70,8 L66,18 L62,6 L60,18" fill="none" stroke="#6b4b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Ears */}
      <ellipse cx="44" cy="28" rx="5" ry="3" fill="#a06830" transform="rotate(-20,44,28)" />
      <ellipse cx="72" cy="28" rx="5" ry="3" fill="#a06830" transform="rotate(20,72,28)" />
      {/* Eyes */}
      <EyesRound cx={58} cy={33} spacing={7} />
      {/* Nose */}
      <NoseSmall cx={58} cy={39} />
      {/* Spots on body */}
      <circle cx="50" cy="72" r="2.5" fill="#e8d0b0" opacity="0.6" />
      <circle cx="60" cy="78" r="2" fill="#e8d0b0" opacity="0.6" />
      <circle cx="66" cy="70" r="3" fill="#e8d0b0" opacity="0.6" />
    </svg>
  );
}
```

- [ ] **Step 2: Create SheepSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function SheepSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — fluffy cloud shape */}
      <circle cx="46" cy="72" r="14" fill="#f5f0e8" />
      <circle cx="58" cy="68" r="16" fill="#f5f0e8" />
      <circle cx="70" cy="72" r="14" fill="#f5f0e8" />
      <circle cx="52" cy="78" r="13" fill="#f5f0e8" />
      <circle cx="64" cy="78" r="13" fill="#f5f0e8" />
      {/* Legs */}
      <rect x="44" y="82" width="5" height="14" rx="2.5" fill="#8b7b6b" />
      <rect x="54" y="84" width="5" height="12" rx="2.5" fill="#8b7b6b" />
      <rect x="62" y="84" width="5" height="12" rx="2.5" fill="#8b7b6b" />
      <rect x="68" y="82" width="5" height="14" rx="2.5" fill="#8b7b6b" />
      {/* Head */}
      <ellipse cx="52" cy="44" rx="14" ry="12" fill="#3a3a3a" />
      {/* Fluffy head wool */}
      <circle cx="44" cy="38" r="9" fill="#f5f0e8" />
      <circle cx="52" cy="36" r="10" fill="#f5f0e8" />
      <circle cx="60" cy="38" r="9" fill="#f5f0e8" />
      {/* Ears — floppy */}
      <ellipse cx="36" cy="44" rx="6" ry="10" fill="#3a3a3a" transform="rotate(15,36,44)" />
      <ellipse cx="68" cy="44" rx="6" ry="10" fill="#3a3a3a" transform="rotate(-15,68,44)" />
      {/* Eyes */}
      <EyesRound cx={52} cy={42} spacing={7} />
      {/* Nose */}
      <NoseSmall cx={52} cy={50} />
      {/* Mouth */}
      <path d="M47,53 Q52,56 57,53" fill="none" stroke="#f5f0e8" strokeWidth="0.8" />
    </svg>
  );
}
```

- [ ] **Step 3: Create GoatSvg.tsx**

```tsx
import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function GoatSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="18" ry="14" fill="#d4c8b0" />
      <ellipse cx="58" cy="66" rx="12" ry="8" fill="#e8e0d0" />
      {/* Neck */}
      <rect x="50" y="38" width="14" height="20" rx="7" fill="#d4c8b0" />
      {/* Head */}
      <ellipse cx="56" cy="36" rx="16" ry="12" fill="#d4c8b0" />
      {/* Horns — curved back */}
      <path d="M44,28 Q36,16 44,10" fill="none" stroke="#8b7b6b" strokeWidth="3" strokeLinecap="round" />
      <path d="M68,28 Q76,16 68,10" fill="none" stroke="#8b7b6b" strokeWidth="3" strokeLinecap="round" />
      {/* Ears */}
      <ellipse cx="40" cy="32" rx="5" ry="3" fill="#b8a890" transform="rotate(-15,40,32)" />
      <ellipse cx="72" cy="32" rx="5" ry="3" fill="#b8a890" transform="rotate(15,72,32)" />
      {/* Beard */}
      <path d="M52,46 L52,56" stroke="#d4c8b0" strokeWidth="3" strokeLinecap="round" />
      <path d="M56,46 L56,58" stroke="#d4c8b0" strokeWidth="3" strokeLinecap="round" />
      <path d="M60,46 L60,56" stroke="#d4c8b0" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <EyesAlmond cx={56} cy={34} spacing={8} />
      {/* Nose */}
      <NoseSmall cx={56} cy={42} />
      {/* Mouth */}
      <path d="M50,46 Q56,50 62,46" fill="none" stroke="#6b5b4b" strokeWidth="1" />
    </svg>
  );
}
```

- [ ] **Step 4: Create HorseSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function HorseSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="22" ry="16" fill="#8b5e3c" />
      {/* Neck */}
      <path d="M50,62 Q44,40 48,22 L62,20 Q60,40 64,62" fill="#8b5e3c" />
      {/* Head — long face */}
      <ellipse cx="54" cy="22" rx="10" ry="8" fill="#8b5e3c" />
      <ellipse cx="54" cy="28" rx="8" ry="10" fill="#8b5e3c" />
      {/* Ears */}
      <polygon points="48,16 46,4 52,14" fill="#8b5e3c" />
      <polygon points="60,16 62,4 56,14" fill="#8b5e3c" />
      <polygon points="48,15 47,6 51,14" fill="#c09870" />
      <polygon points="60,15 61,6 57,14" fill="#c09870" />
      {/* Mane */}
      <path d="M50,20 Q42,30 46,44" fill="none" stroke="#5a3a1a" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <EyesRound cx={54} cy={22} spacing={6} />
      {/* Nose */}
      <NoseSnout cx={54} cy={32} />
    </svg>
  );
}
```

- [ ] **Step 5: Create CowSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function CowSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="22" ry="16" fill="#fff" />
      {/* Black patches */}
      <ellipse cx="50" cy="68" rx="7" ry="6" fill="#2d2d2d" />
      <ellipse cx="68" cy="76" rx="6" ry="5" fill="#2d2d2d" />
      {/* Neck */}
      <rect x="50" y="38" width="16" height="22" rx="8" fill="#fff" />
      {/* Head */}
      <ellipse cx="58" cy="38" rx="16" ry="13" fill="#fff" />
      {/* Black head patch */}
      <ellipse cx="58" cy="34" rx="8" ry="6" fill="#2d2d2d" />
      {/* Ears */}
      <ellipse cx="42" cy="34" rx="6" ry="4" fill="#fff" />
      <ellipse cx="42" cy="34" rx="4" ry="2.5" fill="#e8c0c0" />
      <ellipse cx="74" cy="34" rx="6" ry="4" fill="#fff" />
      <ellipse cx="74" cy="34" rx="4" ry="2.5" fill="#e8c0c0" />
      {/* Horns */}
      <path d="M44,28 L40,18" stroke="#e8d0b0" strokeWidth="3" strokeLinecap="round" />
      <path d="M72,28 L76,18" stroke="#e8d0b0" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <EyesRound cx={58} cy={38} spacing={8} />
      {/* Snout — pink */}
      <ellipse cx="58" cy="48" rx="10" ry="7" fill="#e8c0c0" />
      {/* Nose */}
      <NoseSnout cx={58} cy={46} />
    </svg>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/animals/DeerSvg.tsx components/animals/SheepSvg.tsx components/animals/GoatSvg.tsx components/animals/HorseSvg.tsx components/animals/CowSvg.tsx
git commit -m "feat: add ungulate family SVG animals (deer, sheep, goat, horse, cow)"
```

---

### Task 6: Bird family — Bird, Owl, Eagle

**Files:**
- Create: `components/animals/BirdSvg.tsx`
- Create: `components/animals/OwlSvg.tsx`
- Create: `components/animals/EagleSvg.tsx`

- [ ] **Step 1: Create BirdSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function BirdSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail feathers */}
      <polygon points="56,76 48,96 58,86" fill="#4a8ad0" />
      <polygon points="58,76 58,98 62,86" fill="#3a6ab0" />
      <polygon points="60,76 68,96 60,86" fill="#4a8ad0" />
      {/* Body */}
      <ellipse cx="56" cy="64" rx="16" ry="18" fill="#4a8ad0" />
      <ellipse cx="56" cy="58" rx="12" ry="10" fill="#e8a060" />
      {/* Wing */}
      <ellipse cx="66" cy="64" rx="8" ry="14" fill="#3a6ab0" transform="rotate(10,66,64)" />
      {/* Head */}
      <circle cx="54" cy="40" r="14" fill="#4a8ad0" />
      {/* Eye white */}
      <circle cx="54" cy="38" r="5" fill="#fff" />
      <circle cx="54" cy="38" r="3" fill="#1a1a1a" />
      <circle cx="54" cy="37" r="1" fill="#fff" />
      {/* Beak */}
      <polygon points="64,40 76,42 64,44" fill="#f0a030" />
      {/* Crest */}
      <path d="M44,30 Q42,22 46,28" fill="none" stroke="#4a8ad0" strokeWidth="3" strokeLinecap="round" />
      <path d="M48,28 Q48,18 50,26" fill="none" stroke="#4a8ad0" strokeWidth="3" strokeLinecap="round" />
      <path d="M52,27 Q54,17 54,25" fill="none" stroke="#4a8ad0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Create OwlSvg.tsx**

```tsx
import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function OwlSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="66" rx="20" ry="22" fill="#8b6b4b" />
      {/* Belly feathers */}
      <ellipse cx="58" cy="70" rx="14" ry="14" fill="#c0a880" />
      <path d="M48,62 L58,78 L68,62" fill="none" stroke="#a08860" strokeWidth="1" />
      <path d="M52,60 L58,72 L64,60" fill="none" stroke="#a08860" strokeWidth="1" />
      {/* Wings */}
      <ellipse cx="40" cy="66" rx="8" ry="16" fill="#6b4b2b" transform="rotate(5,40,66)" />
      <ellipse cx="76" cy="66" rx="8" ry="16" fill="#6b4b2b" transform="rotate(-5,76,66)" />
      {/* Head */}
      <ellipse cx="58" cy="40" rx="22" ry="18" fill="#8b6b4b" />
      {/* Ear tufts */}
      <polygon points="40,26 36,8 46,22" fill="#8b6b4b" />
      <polygon points="76,26 80,8 70,22" fill="#8b6b4b" />
      {/* Facial disc */}
      <ellipse cx="58" cy="42" rx="16" ry="14" fill="#c0a880" />
      {/* Eye rings */}
      <circle cx="48" cy="40" r="8" fill="#fff" />
      <circle cx="68" cy="40" r="8" fill="#fff" />
      <circle cx="48" cy="40" r="4" fill="#f0a030" />
      <circle cx="68" cy="40" r="4" fill="#f0a030" />
      <circle cx="48" cy="40" r="2.5" fill="#1a1a1a" />
      <circle cx="68" cy="40" r="2.5" fill="#1a1a1a" />
      {/* Beak */}
      <polygon points="56,46 60,46 58,52" fill="#f0a030" />
      {/* Feet */}
      <path d="M48,86 L44,96 M48,86 L48,96 M48,86 L52,96" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
      <path d="M68,86 L64,96 M68,86 L68,96 M68,86 L72,96" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 3: Create EagleSvg.tsx**

```tsx
import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function EagleSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="66" rx="18" ry="16" fill="#5a4a3a" />
      <ellipse cx="58" cy="60" rx="12" ry="9" fill="#8b7b6b" />
      {/* Wings — spread wide */}
      <path d="M40,64 Q20,50 10,54 Q24,62 38,68" fill="#4a3a2a" />
      <path d="M76,64 Q96,50 106,54 Q92,62 78,68" fill="#4a3a2a" />
      {/* Tail feathers */}
      <polygon points="50,80 44,100 56,84" fill="#4a3a2a" />
      <polygon points="58,80 58,102 62,84" fill="#3a2a1a" />
      <polygon points="66,80 72,100 60,84" fill="#4a3a2a" />
      {/* Head */}
      <ellipse cx="58" cy="44" rx="14" ry="13" fill="#5a4a3a" />
      {/* White head cap */}
      <ellipse cx="58" cy="38" rx="12" ry="8" fill="#fff" />
      {/* Eyes */}
      <circle cx="52" cy="42" r="3" fill="#f0a030" />
      <circle cx="52" cy="42" r="2" fill="#1a1a1a" />
      {/* Beak — hooked */}
      <path d="M62,44 L80,38 L76,42 L80,46" fill="#f0a030" />
      {/* Feet — talons */}
      <path d="M48,82 L44,94 M48,82 L48,94 M48,82 L52,94" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
      <path d="M68,82 L64,94 M68,82 L68,94 M68,82 L72,94" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/animals/BirdSvg.tsx components/animals/OwlSvg.tsx components/animals/EagleSvg.tsx
git commit -m "feat: add bird family SVG animals (bird, owl, eagle)"
```

---

### Task 7: Other animals A — Rabbit, Squirrel, Monkey, Elephant

**Files:**
- Create: `components/animals/RabbitSvg.tsx`
- Create: `components/animals/SquirrelSvg.tsx`
- Create: `components/animals/MonkeySvg.tsx`
- Create: `components/animals/ElephantSvg.tsx`

- [ ] **Step 1: Create RabbitSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function RabbitSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="18" ry="16" fill="#e8d0c0" />
      <ellipse cx="58" cy="66" rx="12" ry="9" fill="#fff5ee" />
      {/* Head */}
      <ellipse cx="56" cy="44" rx="18" ry="17" fill="#e8d0c0" />
      {/* Long ears */}
      <ellipse cx="44" cy="18" rx="6" ry="16" fill="#e8d0c0" transform="rotate(-5,44,18)" />
      <ellipse cx="44" cy="18" rx="3.5" ry="12" fill="#f0c0c0" transform="rotate(-5,44,18)" />
      <ellipse cx="68" cy="18" rx="6" ry="16" fill="#e8d0c0" transform="rotate(5,68,18)" />
      <ellipse cx="68" cy="18" rx="3.5" ry="12" fill="#f0c0c0" transform="rotate(5,68,18)" />
      {/* Cheeks */}
      <ellipse cx="40" cy="48" rx="7" ry="5.5" fill="#fff5ee" />
      <ellipse cx="72" cy="48" rx="7" ry="5.5" fill="#fff5ee" />
      {/* Eyes */}
      <EyesRound cx={56} cy={42} spacing={9} />
      {/* Nose */}
      <NoseSmall cx={56} cy={49} />
      {/* Mouth */}
      <path d="M51,52 Q54,55 56,52 Q58,55 61,52" fill="none" stroke="#c0a090" strokeWidth="0.8" />
      {/* Tail — fluffy circle */}
      <circle cx="78" cy="78" r="8" fill="#fff5ee" />
    </svg>
  );
}
```

- [ ] **Step 2: Create SquirrelSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function SquirrelSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Big bushy tail */}
      <path d="M72,74 Q98,60 94,38 Q92,56 82,68" fill="#c08040" />
      <path d="M74,72 Q92,58 90,42 Q88,54 80,66" fill="#e8c090" />
      {/* Body */}
      <ellipse cx="56" cy="68" rx="16" ry="14" fill="#c08040" />
      <ellipse cx="56" cy="62" rx="10" ry="8" fill="#e8c090" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="15" ry="14" fill="#c08040" />
      {/* Ears */}
      <ellipse cx="42" cy="32" rx="5" ry="6" fill="#c08040" />
      <ellipse cx="42" cy="32" rx="3" ry="4" fill="#e8c090" />
      <ellipse cx="66" cy="32" rx="5" ry="6" fill="#c08040" />
      <ellipse cx="66" cy="32" rx="3" ry="4" fill="#e8c090" />
      {/* Cheeks */}
      <ellipse cx="40" cy="46" rx="6" ry="5" fill="#e8c090" />
      <ellipse cx="68" cy="46" rx="6" ry="5" fill="#e8c090" />
      {/* Eyes */}
      <EyesRound cx={54} cy={42} spacing={8} />
      {/* Nose */}
      <NoseSmall cx={54} cy={49} />
      {/* Mouth */}
      <path d="M49,52 Q54,55 59,52" fill="none" stroke="#6b4b30" strokeWidth="0.8" />
      {/* Acorn in paws */}
      <ellipse cx="44" cy="62" rx="4" ry="5" fill="#8b6b30" />
      <rect x="42" y="56" width="4" height="3" rx="1" fill="#6b4b1a" />
    </svg>
  );
}
```

- [ ] **Step 3: Create MonkeySvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function MonkeySvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail — curly */}
      <path d="M72,72 Q90,62 90,48 Q90,36 82,38" fill="none" stroke="#8b6b4b" strokeWidth="5" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="56" cy="70" rx="16" ry="15" fill="#8b6b4b" />
      <ellipse cx="56" cy="64" rx="10" ry="8" fill="#b89870" />
      {/* Head */}
      <ellipse cx="56" cy="42" rx="18" ry="17" fill="#b89870" />
      {/* Face — heart-shaped lighter area */}
      <ellipse cx="56" cy="46" rx="13" ry="12" fill="#e8d0b8" />
      {/* Ears — big round */}
      <circle cx="36" cy="36" r="8" fill="#b89870" />
      <circle cx="36" cy="36" r="5" fill="#e8c0a0" />
      <circle cx="76" cy="36" r="8" fill="#b89870" />
      <circle cx="76" cy="36" r="5" fill="#e8c0a0" />
      {/* Eyes */}
      <EyesRound cx={56} cy={42} spacing={8} />
      {/* Nose */}
      <NoseSnout cx={56} cy={50} />
      {/* Mouth — wide smile */}
      <path d="M48,54 Q56,62 64,54" fill="none" stroke="#3a2a1a" strokeWidth="1.2" />
    </svg>
  );
}
```

- [ ] **Step 4: Create ElephantSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";

interface Props {
  width?: number;
  height?: number;
}

export default function ElephantSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — large */}
      <ellipse cx="58" cy="72" rx="24" ry="18" fill="#909090" />
      {/* Head */}
      <ellipse cx="58" cy="44" rx="20" ry="18" fill="#909090" />
      {/* Ears — big floppy */}
      <ellipse cx="36" cy="44" rx="12" ry="18" fill="#787878" transform="rotate(5,36,44)" />
      <ellipse cx="36" cy="44" rx="8" ry="13" fill="#c0a0a0" transform="rotate(5,36,44)" />
      <ellipse cx="80" cy="44" rx="12" ry="18" fill="#787878" transform="rotate(-5,80,44)" />
      <ellipse cx="80" cy="44" rx="8" ry="13" fill="#c0a0a0" transform="rotate(-5,80,44)" />
      {/* Trunk */}
      <path d="M58,54 Q58,70 52,80 Q48,86 52,80 Q56,74 60,62" fill="none" stroke="#909090" strokeWidth="8" strokeLinecap="round" />
      <path d="M58,54 Q58,70 52,80 Q48,86 52,80 Q56,74 60,62" fill="none" stroke="#787878" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      {/* Eyes */}
      <EyesRound cx={58} cy={42} spacing={8} />
      {/* Tusks */}
      <path d="M50,54 Q46,64 48,62" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66,54 Q70,64 68,62" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <rect x="42" y="84" width="8" height="12" rx="4" fill="#787878" />
      <rect x="52" y="86" width="8" height="12" rx="4" fill="#787878" />
      <rect x="62" y="86" width="8" height="12" rx="4" fill="#787878" />
      <rect x="70" y="84" width="8" height="12" rx="4" fill="#787878" />
    </svg>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/animals/RabbitSvg.tsx components/animals/SquirrelSvg.tsx components/animals/MonkeySvg.tsx components/animals/ElephantSvg.tsx
git commit -m "feat: add other SVG animals (rabbit, squirrel, monkey, elephant)"
```

---

### Task 8: Other animals B — Snake, Turtle, Fish, Butterfly, Dolphin

**Files:**
- Create: `components/animals/SnakeSvg.tsx`
- Create: `components/animals/TurtleSvg.tsx`
- Create: `components/animals/FishSvg.tsx`
- Create: `components/animals/ButterflySvg.tsx`
- Create: `components/animals/DolphinSvg.tsx`

- [ ] **Step 1: Create SnakeSvg.tsx**

```tsx
import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function SnakeSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — S-curve */}
      <path d="M36,80 Q50,92 60,78 Q70,64 60,52 Q50,40 60,30 Q68,22 76,24" fill="none" stroke="#4a8a4a" strokeWidth="10" strokeLinecap="round" />
      {/* Belly pattern */}
      <path d="M36,80 Q50,92 60,78 Q70,64 60,52 Q50,40 60,30 Q68,22 76,24" fill="none" stroke="#6aba6a" strokeWidth="4" strokeLinecap="round" strokeDasharray="4,8" />
      {/* Head */}
      <ellipse cx="76" cy="24" rx="8" ry="6" fill="#4a8a4a" transform="rotate(-15,76,24)" />
      {/* Eyes */}
      <circle cx="78" cy="22" r="2.5" fill="#fff" />
      <circle cx="78" cy="22" r="1.5" fill="#1a1a1a" />
      <circle cx="82" cy="23" r="2.5" fill="#fff" />
      <circle cx="82" cy="23" r="1.5" fill="#1a1a1a" />
      {/* Tongue */}
      <path d="M82,27 L90,28 L92,26 M90,28 L92,30" fill="none" stroke="#e04040" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Create TurtleSvg.tsx**

```tsx
import React from "react";
import EyesRound from "./shared/face/EyesRound";

interface Props {
  width?: number;
  height?: number;
}

export default function TurtleSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Shell */}
      <ellipse cx="58" cy="66" rx="26" ry="18" fill="#5a8a3a" />
      <ellipse cx="58" cy="64" rx="22" ry="14" fill="#7aba4a" />
      {/* Shell pattern */}
      <path d="M40,62 L58,52 L76,62" fill="none" stroke="#5a8a3a" strokeWidth="1.5" />
      <path d="M40,62 L58,72 L76,62" fill="none" stroke="#5a8a3a" strokeWidth="1.5" />
      <path d="M44,58 L58,68 L44,68" fill="none" stroke="#5a8a3a" strokeWidth="1" />
      <path d="M72,58 L58,68 L72,68" fill="none" stroke="#5a8a3a" strokeWidth="1" />
      {/* Head */}
      <ellipse cx="84" cy="60" rx="10" ry="8" fill="#8ac860" />
      {/* Neck */}
      <ellipse cx="76" cy="62" rx="6" ry="6" fill="#8ac860" />
      {/* Eyes */}
      <EyesRound cx={84} cy={58} spacing={5} />
      {/* Mouth */}
      <path d="M90,62 Q92,64 90,65" fill="none" stroke="#3a5a1a" strokeWidth="0.8" />
      {/* Legs */}
      <ellipse cx="42" cy="72" rx="7" ry="5" fill="#8ac860" />
      <ellipse cx="74" cy="78" rx="7" ry="5" fill="#8ac860" />
      <ellipse cx="40" cy="58" rx="6" ry="5" fill="#8ac860" />
      <ellipse cx="76" cy="52" rx="6" ry="5" fill="#8ac860" />
      {/* Tail */}
      <polygon points="34,60 24,56 34,64" fill="#8ac860" />
    </svg>
  );
}
```

- [ ] **Step 3: Create FishSvg.tsx**

```tsx
import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function FishSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="54" cy="58" rx="28" ry="16" fill="#e88040" />
      {/* Belly highlight */}
      <ellipse cx="56" cy="62" rx="20" ry="8" fill="#f0a860" />
      {/* Tail fin */}
      <polygon points="26,58 10,42 16,58 10,74" fill="#e06030" />
      {/* Dorsal fin */}
      <path d="M44,42 Q54,28 66,42" fill="#e06030" />
      {/* Pectoral fin */}
      <path d="M50,66 Q56,78 62,66" fill="#f0a860" />
      {/* Eye */}
      <circle cx="70" cy="54" r="6" fill="#fff" />
      <circle cx="70" cy="54" r="3.5" fill="#2a1a0a" />
      <circle cx="71" cy="53" r="1.5" fill="#fff" />
      {/* Mouth */}
      <path d="M80,58 Q84,60 80,62" fill="none" stroke="#c04020" strokeWidth="1.2" />
      {/* Scales hint */}
      <path d="M54,50 Q60,54 54,58" fill="none" stroke="#d06030" strokeWidth="0.8" opacity="0.5" />
      <path d="M60,48 Q66,52 60,56" fill="none" stroke="#d06030" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
```

- [ ] **Step 4: Create ButterflySvg.tsx**

```tsx
import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function ButterflySvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Upper left wing */}
      <ellipse cx="38" cy="38" rx="20" ry="16" fill="#e88060" transform="rotate(-20,38,38)" />
      <ellipse cx="40" cy="36" rx="12" ry="10" fill="#f0a880" transform="rotate(-20,40,36)" />
      <circle cx="36" cy="34" r="5" fill="#f0d060" opacity="0.6" />
      {/* Upper right wing */}
      <ellipse cx="78" cy="38" rx="20" ry="16" fill="#e88060" transform="rotate(20,78,38)" />
      <ellipse cx="76" cy="36" rx="12" ry="10" fill="#f0a880" transform="rotate(20,76,36)" />
      <circle cx="80" cy="34" r="5" fill="#f0d060" opacity="0.6" />
      {/* Lower left wing */}
      <ellipse cx="42" cy="60" rx="14" ry="12" fill="#e88060" transform="rotate(-10,42,60)" />
      <ellipse cx="44" cy="58" rx="8" ry="7" fill="#f0a880" transform="rotate(-10,44,58)" />
      {/* Lower right wing */}
      <ellipse cx="74" cy="60" rx="14" ry="12" fill="#e88060" transform="rotate(10,74,60)" />
      <ellipse cx="72" cy="58" rx="8" ry="7" fill="#f0a880" transform="rotate(10,72,58)" />
      {/* Body */}
      <ellipse cx="58" cy="52" rx="4" ry="18" fill="#4a3a2a" />
      {/* Head */}
      <circle cx="58" cy="36" r="5" fill="#4a3a2a" />
      {/* Antennae */}
      <path d="M56,32 Q48,18 44,22" fill="none" stroke="#4a3a2a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60,32 Q68,18 72,22" fill="none" stroke="#4a3a2a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="44" cy="22" r="2" fill="#e88060" />
      <circle cx="72" cy="22" r="2" fill="#e88060" />
    </svg>
  );
}
```

- [ ] **Step 5: Create DolphinSvg.tsx**

```tsx
import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function DolphinSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — curved leaping shape */}
      <path d="M30,68 Q36,40 58,36 Q80,34 92,44 Q96,46 92,48 Q84,40 62,40 Q44,42 40,62 Q38,74 48,82 Q56,88 70,86 Q82,84 92,74" fill="#6088c0" />
      {/* Belly */}
      <path d="M36,66 Q42,46 58,42 Q74,40 88,46" fill="none" stroke="#a0c8e8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      {/* Dorsal fin */}
      <path d="M58,38 Q62,24 72,30" fill="#5080b0" />
      {/* Tail fluke */}
      <polygon points="30,68 14,60 18,68 14,76" fill="#5080b0" />
      {/* Pectoral fin */}
      <path d="M52,60 Q48,74 56,72" fill="#5080b0" />
      {/* Eye */}
      <circle cx="84" cy="42" r="3" fill="#1a2a3a" />
      <circle cx="85" cy="41" r="1" fill="#fff" />
      {/* Mouth — smiling arc */}
      <path d="M86,48 Q92,52 94,50" fill="none" stroke="#4060a0" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/animals/SnakeSvg.tsx components/animals/TurtleSvg.tsx components/animals/FishSvg.tsx components/animals/ButterflySvg.tsx components/animals/DolphinSvg.tsx
git commit -m "feat: add other SVG animals (snake, turtle, fish, butterfly, dolphin)"
```

---

### Task 9: Create AnimalIcon + index.ts barrel

**Files:**
- Create: `components/animals/index.ts`

- [ ] **Step 1: Create index.ts**

```tsx
import React from "react";
import type { ComponentType } from "react";

import FoxSvg from "./FoxSvg";
import WolfSvg from "./WolfSvg";
import DogSvg from "./DogSvg";
import CatSvg from "./CatSvg";
import TigerSvg from "./TigerSvg";
import LionSvg from "./LionSvg";
import BearSvg from "./BearSvg";
import PandaSvg from "./PandaSvg";
import DeerSvg from "./DeerSvg";
import SheepSvg from "./SheepSvg";
import GoatSvg from "./GoatSvg";
import HorseSvg from "./HorseSvg";
import CowSvg from "./CowSvg";
import BirdSvg from "./BirdSvg";
import OwlSvg from "./OwlSvg";
import EagleSvg from "./EagleSvg";
import RabbitSvg from "./RabbitSvg";
import SquirrelSvg from "./SquirrelSvg";
import MonkeySvg from "./MonkeySvg";
import ElephantSvg from "./ElephantSvg";
import SnakeSvg from "./SnakeSvg";
import TurtleSvg from "./TurtleSvg";
import FishSvg from "./FishSvg";
import ButterflySvg from "./ButterflySvg";
import DolphinSvg from "./DolphinSvg";

type SvgComponent = ComponentType<{ width?: number; height?: number }>;

const animalSvgMap: Record<string, SvgComponent> = {
  fox: FoxSvg,
  wolf: WolfSvg,
  dog: DogSvg,
  cat: CatSvg,
  tiger: TigerSvg,
  lion: LionSvg,
  bear: BearSvg,
  panda: PandaSvg,
  deer: DeerSvg,
  sheep: SheepSvg,
  goat: GoatSvg,
  horse: HorseSvg,
  cow: CowSvg,
  bird: BirdSvg,
  owl: OwlSvg,
  eagle: EagleSvg,
  rabbit: RabbitSvg,
  bunny: RabbitSvg,
  squirrel: SquirrelSvg,
  monkey: MonkeySvg,
  elephant: ElephantSvg,
  snake: SnakeSvg,
  turtle: TurtleSvg,
  fish: FishSvg,
  butterfly: ButterflySvg,
  dolphin: DolphinSvg,
};

interface AnimalIconProps {
  name: string;
  size?: number;
}

export function AnimalIcon({ name, size = 96 }: AnimalIconProps) {
  const lower = name.toLowerCase().trim();
  const SvgComp = animalSvgMap[lower];

  if (!SvgComp) {
    for (const [key, comp] of Object.entries(animalSvgMap)) {
      if (lower.includes(key)) {
        return <comp width={size} height={size} />;
      }
    }
    return (
      <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>🌿</span>
    );
  }

  return <SvgComp width={size} height={size} />;
}

export { animalSvgMap };
```

- [ ] **Step 2: Commit**

```bash
git add components/animals/index.ts
git commit -m "feat: add AnimalIcon component with animal lookup map"
```

---

### Task 10: Update lib/animals.ts — add backward-compatible SVG field

**Files:**
- Modify: `lib/animals.ts`

- [ ] **Step 1: Update AnimalIllustration interface and animalMap**

Add `svg` field (optional, backward-compatible). No consumer is required to use it — the new `AnimalIcon` component handles rendering directly.

The only change is adding a comment noting that `AnimalIcon` from `components/animals` is now the preferred way to render animal illustrations.

```tsx
export interface AnimalIllustration {
  emoji: string;
  label: string;
  /** Use AnimalIcon component from components/animals for SVG rendering */
  svgKey?: string;
}

const animalMap: Record<string, AnimalIllustration> = {
  rabbit: { emoji: "🐰", label: "兔子", svgKey: "rabbit" },
  bunny: { emoji: "🐰", label: "兔子", svgKey: "rabbit" },
  deer: { emoji: "🦌", label: "鹿", svgKey: "deer" },
  sheep: { emoji: "🐑", label: "羊", svgKey: "sheep" },
  goat: { emoji: "🐐", label: "山羊", svgKey: "goat" },
  horse: { emoji: "🐴", label: "马", svgKey: "horse" },
  cow: { emoji: "🐮", label: "牛", svgKey: "cow" },
  elephant: { emoji: "🐘", label: "大象", svgKey: "elephant" },
  fox: { emoji: "🦊", label: "狐狸", svgKey: "fox" },
  bear: { emoji: "🐻", label: "熊", svgKey: "bear" },
  tiger: { emoji: "🐯", label: "老虎", svgKey: "tiger" },
  lion: { emoji: "🦁", label: "狮子", svgKey: "lion" },
  wolf: { emoji: "🐺", label: "狼", svgKey: "wolf" },
  dog: { emoji: "🐕", label: "狗", svgKey: "dog" },
  cat: { emoji: "🐈", label: "猫", svgKey: "cat" },
  bird: { emoji: "🐦", label: "鸟", svgKey: "bird" },
  owl: { emoji: "🦉", label: "猫头鹰", svgKey: "owl" },
  snake: { emoji: "🐍", label: "蛇", svgKey: "snake" },
  turtle: { emoji: "🐢", label: "乌龟", svgKey: "turtle" },
  fish: { emoji: "🐟", label: "鱼", svgKey: "fish" },
  butterfly: { emoji: "🦋", label: "蝴蝶", svgKey: "butterfly" },
  monkey: { emoji: "🐒", label: "猴子", svgKey: "monkey" },
  squirrel: { emoji: "🐿", label: "松鼠", svgKey: "squirrel" },
  dolphin: { emoji: "🐬", label: "海豚", svgKey: "dolphin" },
  panda: { emoji: "🐼", label: "熊猫", svgKey: "panda" },
  eagle: { emoji: "🦅", label: "鹰", svgKey: "eagle" },
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/animals.ts
git commit -m "feat: add svgKey field to animal map for SVG lookup"
```

---

### Task 11: Update 3 consumer components

**Files:**
- Modify: `components/result/ServiceCard.tsx`
- Modify: `components/result/ShareCardImage.tsx`
- Modify: `components/profile/HistoryList.tsx`

- [ ] **Step 1: Update ServiceCard.tsx**

Replace the emoji rendering at line 30 with `<AnimalIcon>`.

Old:
```tsx
import { getAnimalIllustration } from "@/lib/animals";
// ...
const illustration = getAnimalIllustration(animalName);
// ...
{illustration.emoji}
```

New:
```tsx
import { AnimalIcon } from "@/components/animals";
// ...
<AnimalIcon name={animalName} size={96} />
```

Full updated file:
```tsx
"use client";

import { motion } from "framer-motion";
import { AnimalIcon } from "@/components/animals";

interface Props {
  animalName: string;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
  onUnlock: () => void;
}

export default function ServiceCard({ animalName, roleTitle, cardTitle, cardInterpretation, onUnlock }: Props) {
  return (
    <motion.div
      className="max-w-sm mx-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-gradient-to-b from-[#0d1f14] to-[#081208] border-2 border-green-800/50 rounded-2xl p-8 text-center shadow-2xl shadow-green-900/20">
        <motion.div
          className="mb-4 flex justify-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <AnimalIcon name={animalName} size={96} />
        </motion.div>

        <p className="text-green-400/50 text-xs tracking-[0.2em] uppercase mb-2">
          服务者原型
        </p>

        <h2 className="text-2xl font-bold text-green-100 mb-1">
          {cardTitle}
        </h2>

        <p className="text-amber-200/80 text-lg font-medium mb-4">
          {roleTitle}
        </p>

        <div className="w-12 h-px bg-green-700/50 mx-auto my-4" />

        <p className="text-white/60 text-sm leading-relaxed">
          {cardInterpretation}
        </p>
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={onUnlock}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium shadow-lg shadow-amber-900/20 hover:shadow-amber-800/30 hover:scale-105 transition-all duration-300"
        >
          查看完整心灵图谱 →
        </button>
        <p className="text-white/20 text-xs mt-2">
          <span className="line-through">¥9.99</span>
          {" "}限时免费
        </p>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Update ShareCardImage.tsx**

Replace emoji at line 32 with `<AnimalIcon>`.

Old:
```tsx
import { getAnimalIllustration } from "@/lib/animals";
// ...
const illustration = getAnimalIllustration(animalName);
// ...
{illustration.emoji}
```

New:
```tsx
import { AnimalIcon } from "@/components/animals";
// ...
<AnimalIcon name={animalName} size={96} />
```

Full updated file:
```tsx
"use client";

import { forwardRef } from "react";
import { AnimalIcon } from "@/components/animals";

interface Props {
  animalName: string;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
}

const ShareCardImage = forwardRef<HTMLDivElement, Props>(
  ({ animalName, roleTitle, cardTitle, cardInterpretation }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[375px] h-[667px] bg-gradient-to-b from-[#0a1a0f] via-[#0d1f14] to-[#061208] flex flex-col items-center justify-center px-8 py-10 text-center select-none"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Brand */}
        <div className="mb-8">
          <div className="text-green-300/60 text-xs tracking-[0.3em] uppercase">
            🌲 Forest Journey
          </div>
        </div>

        {/* Animal SVG */}
        <div className="mb-6">
          <AnimalIcon name={animalName} size={96} />
        </div>

        {/* Label */}
        <p className="text-green-400/40 text-xs tracking-[0.25em] uppercase mb-3">
          服务者原型
        </p>

        {/* Title */}
        <h2 className="text-2xl font-bold text-green-100 mb-1">
          {cardTitle}
        </h2>

        {/* Role */}
        <p className="text-amber-200/70 text-lg font-medium mb-6">
          {roleTitle}
        </p>

        {/* Divider */}
        <div className="w-16 h-px bg-green-700/40 my-2" />

        {/* Core interpretation */}
        <p className="text-white/50 text-sm leading-relaxed max-w-[260px] mt-4">
          {cardInterpretation}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="mt-auto">
          <div className="w-12 h-px bg-green-700/30 mx-auto mb-4" />
          <p className="text-green-400/30 text-xs tracking-wider">
            扫码体验你的心灵之旅
          </p>
          <p className="text-white/15 text-xs mt-1 font-mono">
            forest-journey.vercel.app
          </p>
        </div>
      </div>
    );
  }
);

ShareCardImage.displayName = "ShareCardImage";

export default ShareCardImage;
```

- [ ] **Step 3: Update HistoryList.tsx**

Old (lines 6, 143-145):
```tsx
import { getAnimalIllustration } from "@/lib/animals";
// ...
<span className="text-2xl">
  {report.answers.scene1.animalName
    ? getAnimalIllustration(report.answers.scene1.animalName).emoji
    : "🌿"}
</span>
```

New:
```tsx
import { AnimalIcon } from "@/components/animals";
// ...
<span className="flex items-center">
  {report.answers.scene1.animalName ? (
    <AnimalIcon name={report.answers.scene1.animalName} size={24} />
  ) : (
    "🌿"
  )}
</span>
```

- [ ] **Step 4: Commit**

```bash
git add components/result/ServiceCard.tsx components/result/ShareCardImage.tsx components/profile/HistoryList.tsx
git commit -m "feat: replace emoji with AnimalIcon in ServiceCard, ShareCardImage, and HistoryList"
```

---

### Task 12: Verify — TypeScript, tests, build

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1
```
Expected: 0 errors

- [ ] **Step 2: Run existing tests**

```bash
npx vitest run 2>&1
```
Expected: 17/17 passing

- [ ] **Step 3: Run production build**

```bash
npx next build 2>&1
```
Expected: Compiled successfully, all routes present

- [ ] **Step 4: Start dev server and spot-check**

```bash
# In separate terminal or background:
npx next dev -p 3000 2>&1 &
# Check pages load: /, /assessment, /result, /profile
```

- [ ] **Step 5: Update PROJECT_STATUS.md**

Mark Phase 14 SVG动物插画 as complete. Add to changelog.

- [ ] **Step 6: Final commit**

```bash
git add PROJECT_STATUS.md
git commit -m "docs: mark Phase 14 animal SVG illustrations complete"
```
