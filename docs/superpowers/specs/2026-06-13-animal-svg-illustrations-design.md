# Animal SVG Illustrations — Design Spec

> 2026-06-13 | Phase 14

## Goal

Replace emoji animal rendering with flat-vector SVG illustrations across the result page, share card, and history list.

## Style

Flat vector, warm palette, geometric shapes. Heavily inspired by children's book illustration — approachable, healing, forest-themed.

**Color palette:**
- Primary: warm orange `#e8783a`, cream `#fff5e6`, deep brown `#3a1a00`
- Accent: amber `#f0c078`, moss green `#4a8a4a`
- Line/detail: dark brown `#2d1b0e`

**Design constraints:**
- Must render well on dark green backgrounds (`#0a1a0f` to `#061208`)
- Sizes: 96px (card/report), 24px (list thumbnail), up to 120px (share card PNG)
- Standard viewBox `0 0 120 120` with `currentColor`-free design (own colors)

## Architecture

### New files

```
components/animals/
  shared/
    CanineBody.tsx      ← shared canine base
    FelineBody.tsx      ← shared feline base
    BearBody.tsx        ← shared bear base
    UngulateBody.tsx    ← shared hoofed-animal base
    BirdBody.tsx        ← shared bird base
    face/
      EyesRound.tsx     ← round eyes variant
      EyesAlmond.tsx    ← almond eyes variant
      NoseSmall.tsx     ← small nose
      NoseSnout.tsx     ← snout nose
  FoxSvg.tsx
  WolfSvg.tsx
  DogSvg.tsx
  CatSvg.tsx
  TigerSvg.tsx
  LionSvg.tsx
  BearSvg.tsx
  PandaSvg.tsx
  DeerSvg.tsx
  SheepSvg.tsx
  GoatSvg.tsx
  HorseSvg.tsx
  CowSvg.tsx
  RabbitSvg.tsx
  SquirrelSvg.tsx
  MonkeySvg.tsx
  ElephantSvg.tsx
  BirdSvg.tsx
  OwlSvg.tsx
  EagleSvg.tsx
  SnakeSvg.tsx
  TurtleSvg.tsx
  FishSvg.tsx
  ButterflySvg.tsx
  DolphinSvg.tsx
  index.ts              ← animalName → Component map + AnimalIcon
```

### Modified files

| File | Change |
|------|--------|
| `lib/animals.ts` | `AnimalIllustration` gets optional `svg` field; backward-compatible |
| `components/result/ServiceCard.tsx` | `{illustration.emoji}` → `<AnimalIcon>` |
| `components/result/ShareCardImage.tsx` | `{illustration.emoji}` → `<AnimalIcon>` |
| `components/profile/HistoryList.tsx` | `getAnimalIllustration().emoji` → `<AnimalIcon>` |

### AnimalIcon component

```tsx
// components/animals/index.ts exports:
export function AnimalIcon({ name, size = 96 }: { name: string; size?: number }) {
  const SvgComp = animalSvgMap[name.toLowerCase().trim()];
  if (!SvgComp) return <span style={{ fontSize: size }}>🌿</span>;
  return <SvgComp width={size} height={size} />;
}
```

### Body-family approach

26 animals grouped into 6 families. Families share base body/head shapes. Distinguishing features: ears, tail, snout, horns/antlers, color.

| Family | Animals | Shared base | Distinguishers |
|--------|---------|-------------|----------------|
| Canine | fox, wolf, dog | `CanineBody` | ear shape, fur color, tail fluff |
| Feline | cat, tiger, lion | `FelineBody` | stripes, mane, body size |
| Bear | bear, panda | `BearBody` | black/white vs brown |
| Ungulate | deer, sheep, goat, horse, cow | `UngulateBody` | horns/antlers, spots, neck length |
| Bird | bird, owl, eagle | `BirdBody` | eye size, beak shape, wings |
| Other | rabbit, squirrel, monkey, elephant, snake, turtle, fish, butterfly, dolphin | — | each standalone |

### Fallback

Unknown animals → `🌿` emoji (existing behavior preserved).

## Integration

### Data flow (unchanged)

```
Assessment → localStorage → /result → getAnimalIllustration(name)
                                            ↓
                              AnimalIcon renders SVG component
```

### Consumer rendering

| Component | Size | Context |
|-----------|------|---------|
| `ServiceCard` | 96px | Animated float, dark card bg |
| `ShareCardImage` | 96px | Static, captured to PNG via html-to-image |
| `HistoryList` | 24px | Inline in list row, small thumbnail |

## Non-goals

- No animation within the SVGs themselves (Framer Motion handles float)
- No responsive art direction (same SVG at all sizes)
- No dark/light mode variants (dark green bg is the only context)
- No server-side rendering concerns (all `"use client"` consumers)

## Testing

- TypeScript: 0 errors, all SVG components properly typed
- Visual: render each animal in ServiceCard context (dark bg), verify contrast
- Regression: 17/17 existing tests still pass
- Build: `next build` succeeds (SVGs are client components, no SSR issues)
