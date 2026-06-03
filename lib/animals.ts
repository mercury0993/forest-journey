export interface AnimalIllustration {
  emoji: string;
  label: string;
}

const animalMap: Record<string, AnimalIllustration> = {
  rabbit: { emoji: "🐰", label: "兔子" },
  bunny: { emoji: "🐰", label: "兔子" },
  deer: { emoji: "🦌", label: "鹿" },
  sheep: { emoji: "🐑", label: "羊" },
  goat: { emoji: "🐐", label: "山羊" },
  horse: { emoji: "🐴", label: "马" },
  cow: { emoji: "🐮", label: "牛" },
  elephant: { emoji: "🐘", label: "大象" },
  fox: { emoji: "🦊", label: "狐狸" },
  bear: { emoji: "🐻", label: "熊" },
  tiger: { emoji: "🐯", label: "老虎" },
  lion: { emoji: "🦁", label: "狮子" },
  wolf: { emoji: "🐺", label: "狼" },
  dog: { emoji: "🐕", label: "狗" },
  cat: { emoji: "🐈", label: "猫" },
  bird: { emoji: "🐦", label: "鸟" },
  owl: { emoji: "🦉", label: "猫头鹰" },
  snake: { emoji: "🐍", label: "蛇" },
  turtle: { emoji: "🐢", label: "乌龟" },
  fish: { emoji: "🐟", label: "鱼" },
  butterfly: { emoji: "🦋", label: "蝴蝶" },
  monkey: { emoji: "🐒", label: "猴子" },
  squirrel: { emoji: "🐿", label: "松鼠" },
  dolphin: { emoji: "🐬", label: "海豚" },
  panda: { emoji: "🐼", label: "熊猫" },
  eagle: { emoji: "🦅", label: "鹰" },
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
