import { AnimalCategory } from "./types";

const HERBIVORE_KEYWORDS = [
  "rabbit","bunny","deer","sheep","goat","lamb","horse","cow","elephant","giraffe",
  "squirrel","mouse","hamster","bird","sparrow","dove","butterfly","turtle","tortoise",
  "fish","koala","panda","llama","donkey","pony","fawn","猫","兔","鹿","羊","马",
  "牛","象","长颈鹿","松鼠","鼠","鸟","麻雀","鸽子","蝴蝶","龟","鱼","考拉",
  "熊猫","驴","兔子","小鹿","羔羊","羚羊","斑马","河马","犀牛","袋鼠",
];

const PREDATOR_KEYWORDS = [
  "tiger","lion","leopard","panther","wolf","bear","eagle","hawk","snake",
  "crocodile","shark","dragon","scorpion","spider","vulture","hyena","cheetah",
  "jaguar","虎","狮","豹","狼","熊","鹰","蛇","鳄","鲨","龙","蝎","蜘蛛",
  "秃鹫","鬣狗","猎豹","蟒","隼","枭",
];

const SOCIAL_KEYWORDS = [
  "dog","puppy","horse","dolphin","elephant","monkey","chimp","gorilla","parrot",
  "bee","ant","wolf","raven","crow","magpie","狗","犬","海豚","猴子","猩猩",
  "鹦鹉","蜜蜂","蚂蚁","渡鸦","乌鸦","喜鹊","企鹅","水獭","燕子",
];

const POSITIVE_KEYWORDS = [
  "gentle","warm","friendly","soft","cute","lovely","beautiful","kind","sweet",
  "calm","peaceful","happy","bright","sparkling","graceful","elegant","温柔","温暖",
  "友好","柔软","可爱","美丽","善良","甜","平静","明亮","闪光","优雅","灵动",
  "清澈","纯净","安详","治愈","轻盈","晶莹","透亮","洁白","发光",
];

const NEGATIVE_KEYWORDS = [
  "fierce","scary","angry","dark","sharp","cold","threatening","aggressive",
  "dangerous","frightening","intense","staring","silent","凶猛","可怕","愤怒",
  "黑暗","尖锐","冰冷","威胁","危险","恐惧","紧张","沉默","阴森","锐利",
  "孤傲","戒备","警惕","疏离","压抑",
];

const TRAIT_KEYWORDS: Record<string, string[]> = {
  灵动: ["灵动","机敏","活泼","跳跃","敏捷","轻盈"],
  温和: ["温和","温顺","安静","恬静","温柔","柔顺","乖"],
  威严: ["威严","庄重","沉着","霸气","王者","肃穆"],
  警觉: ["警觉","警惕","机警","戒备","审视","注视"],
  神秘: ["神秘","朦胧","若隐若现","幽深","梦幻","空灵"],
  坚韧: ["坚韧","顽强","不屈","执着","耐力"],
  独立: ["独立","孤傲","独自","单独","独自"],
  好奇: ["好奇","探索","探出头","张望","打量"],
  羞涩: ["害羞","羞涩","怯生生","躲闪","退缩"],
  快乐: ["快乐","欢快","活泼","跳跃","叽叽喳喳"],
};

function classifyAnimal(text: string): AnimalCategory {
  const lower = text.toLowerCase();
  for (const kw of HERBIVORE_KEYWORDS) {
    if (lower.includes(kw)) return "herbivore_gentle";
  }
  for (const kw of PREDATOR_KEYWORDS) {
    if (lower.includes(kw)) return "predator_solitary";
  }
  for (const kw of SOCIAL_KEYWORDS) {
    if (lower.includes(kw)) return "social";
  }
  return "unknown";
}

function classifySentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  let pos = 0, neg = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) pos++;
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) neg++;
  }
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

function extractAnimalName(text: string): string {
  const allKnown = [...HERBIVORE_KEYWORDS, ...PREDATOR_KEYWORDS, ...SOCIAL_KEYWORDS];
  const lower = text.toLowerCase();
  for (const kw of allKnown) {
    if (lower.includes(kw)) return kw;
  }
  const words = text.trim().split(/\s+/);
  return words[0] || "unknown";
}

function extractTraits(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [trait, keywords] of Object.entries(TRAIT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        found.push(trait);
        break;
      }
    }
  }
  return found.slice(0, 3);
}

export interface FallbackResult {
  animal1Name: string;
  animal1Category: AnimalCategory;
  animal2Name: string;
  animal2Category: AnimalCategory;
  animal1Sentiment: "positive" | "neutral" | "negative";
  animal2Sentiment: "positive" | "neutral" | "negative";
  animal1Traits: string[];
  animal2Traits: string[];
  relationshipDynamic: string;
}

export function nlpFallback(animal1Text: string, animal2Text: string, animal2Feeling: string): FallbackResult {
  const cat1 = classifyAnimal(animal1Text);
  const cat2 = classifyAnimal(animal2Text);
  const traits1 = extractTraits(animal1Text);
  const traits2 = extractTraits(animal2Text);

  let dynamic = "各自独立的存在";
  if (cat1 !== "unknown" && cat1 === cat2) {
    dynamic = "同类相遇，彼此映照";
  } else if (cat1 === "herbivore_gentle" && cat2 === "predator_solitary") {
    dynamic = "温柔面对力量，一种微妙的张力";
  } else if (cat1 === "predator_solitary" && cat2 === "herbivore_gentle") {
    dynamic = "守护与被守护的关系";
  }

  return {
    animal1Name: extractAnimalName(animal1Text),
    animal1Category: cat1,
    animal2Name: extractAnimalName(animal2Text),
    animal2Category: cat2,
    animal1Sentiment: classifySentiment(animal1Text),
    animal2Sentiment: classifySentiment(animal2Text + " " + animal2Feeling),
    animal1Traits: traits1.length > 0 ? traits1 : ["独特"],
    animal2Traits: traits2.length > 0 ? traits2 : ["独特"],
    relationshipDynamic: dynamic,
  };
}
