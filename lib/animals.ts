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

export function getAnimalIllustration(name: string): AnimalIllustration {
  const lower = name.toLowerCase().trim();
  if (animalMap[lower]) return animalMap[lower];
  for (const [key, value] of Object.entries(animalMap)) {
    if (lower.includes(key)) return value;
  }
  return { emoji: "🌿", label: name || "森林生灵" };
}

export const ANIMAL_TAGS = [
  { emoji: "🦊", label: "有灵性的", keyword: "fox" },
  { emoji: "🐻", label: "温厚的", keyword: "bear" },
  { emoji: "🦌", label: "警觉的", keyword: "deer" },
  { emoji: "🐰", label: "温柔的", keyword: "rabbit" },
  { emoji: "🦉", label: "智慧的", keyword: "owl" },
];
