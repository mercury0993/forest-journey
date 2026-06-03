import { AnimalCategory, NLPResult } from "./types";

const HERBIVORE_KEYWORDS = ["rabbit", "bunny", "deer", "sheep", "goat", "lamb", "horse", "cow", "elephant", "giraffe", "squirrel", "mouse", "hamster", "bird", "sparrow", "dove", "butterfly", "turtle", "tortoise", "fish", "koala", "panda", "llama", "donkey", "pony", "fawn"];
const PREDATOR_KEYWORDS = ["tiger", "lion", "leopard", "panther", "wolf", "bear", "eagle", "hawk", "snake", "crocodile", "shark", "dragon", "scorpion", "spider", "vulture", "hyena", "cheetah", "jaguar"];
const SOCIAL_KEYWORDS = ["dog", "puppy", "horse", "dolphin", "elephant", "monkey", "chimp", "gorilla", "parrot", "bee", "ant", "wolf", "raven", "crow", "magpie"];

const POSITIVE_KEYWORDS = ["gentle", "warm", "friendly", "soft", "cute", "lovely", "beautiful", "kind", "sweet", "calm", "peaceful", "happy", "bright", "sparkling", "graceful", "elegant"];
const NEGATIVE_KEYWORDS = ["fierce", "scary", "angry", "dark", "sharp", "cold", "threatening", "aggressive", "dangerous", "frightening", "intense", "staring", "silent"];

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
  let pos = 0;
  let neg = 0;
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

export function nlpFallback(animal1Text: string, animal2Text: string, animal2Feeling: string): NLPResult {
  return {
    animal1Name: extractAnimalName(animal1Text),
    animal1Category: classifyAnimal(animal1Text),
    animal2Name: extractAnimalName(animal2Text),
    animal2Category: classifyAnimal(animal2Text),
    animal1Sentiment: classifySentiment(animal1Text),
    animal2Sentiment: classifySentiment(animal2Text + " " + animal2Feeling),
  };
}
