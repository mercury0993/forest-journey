"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ANIMAL_TAGS } from "@/lib/animals";

interface Props {
  sceneNumber: 1 | 4;
  isScene4?: boolean;
  onComplete: (data: {
    animalName: string;
    description: string;
    followUp1: string;
    followUp2: string;
    skipped: boolean;
    firstFeeling?: string;
  }) => void;
}

export default function SceneAnimal({ sceneNumber, isScene4, onComplete }: Props) {
  const [step, setStep] = useState<"name" | "followUp1" | "followUp2" | "feeling">("name");
  const [animalName, setAnimalName] = useState("");
  const [description, setDescription] = useState("");
  const [followUp1, setFollowUp1] = useState("");
  const [followUp2, setFollowUp2] = useState("");
  const [firstFeeling, setFirstFeeling] = useState("");

  const guideText = sceneNumber === 1
    ? "你走进一片森林，看见了一只动物……"
    : "你继续往前走，遇到了另一只动物……";

  const handleTagClick = (tag: { label: string; emoji: string }) => {
    setAnimalName((prev) => (prev ? `${prev}，${tag.emoji} ${tag.label}` : `${tag.emoji} ${tag.label}`));
  };

  const handleSkip = () => {
    onComplete({ animalName: "", description: "", followUp1: "", followUp2: "", skipped: true });
  };

  const handleNext = () => {
    if (step === "name") {
      setStep("followUp1");
    } else if (step === "followUp1") {
      setStep("followUp2");
    } else if (step === "followUp2") {
      if (isScene4) {
        setStep("feeling");
      } else {
        onComplete({ animalName, description, followUp1, followUp2, skipped: false });
      }
    } else if (step === "feeling") {
      onComplete({ animalName, description, followUp1, followUp2, skipped: false, firstFeeling });
    }
  };

  const feelingOptions = [
    { value: "warm_joy", label: "温暖喜悦", emoji: "🥰" },
    { value: "care", label: "想去呵护", emoji: "🤲" },
    { value: "equal_respect", label: "平等尊重", emoji: "🤝" },
    { value: "nervous", label: "有些紧张", emoji: "😰" },
    { value: "curious", label: "好奇观察", emoji: "🔍" },
  ];

  return (
    <motion.div
      className="max-w-lg mx-auto px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-green-200/70 text-sm mb-8 text-center italic">{guideText}</p>

      {step === "name" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">这是什么动物？</label>
          <input
            type="text"
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
            placeholder="例如：一只白色的兔子……"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {ANIMAL_TAGS.map((tag) => (
              <button
                key={tag.keyword}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-green-900/20 hover:border-green-500/30 hover:text-white/80 transition-colors"
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "followUp1" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">它正在做什么？眼神是怎样的？</label>
          <textarea
            value={followUp1}
            onChange={(e) => setFollowUp1(e.target.value)}
            placeholder="描述一下它的状态……"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
            autoFocus
          />
        </div>
      )}

      {step === "followUp2" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">它看到你了吗？你们有交流吗？</label>
          <input
            type="text"
            value={followUp2}
            onChange={(e) => setFollowUp2(e.target.value)}
            placeholder="（选填，按 Enter 跳过）"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNext();
            }}
          />
        </div>
      )}

      {step === "feeling" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">你的第一感觉是什么？</label>
          <div className="grid grid-cols-2 gap-3">
            {feelingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFirstFeeling(opt.value);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  firstFeeling === opt.value
                    ? "border-green-500 bg-green-900/20 text-green-100"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="ml-2">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <button onClick={handleSkip} className="text-white/20 hover:text-white/40 text-sm transition-colors">
          没看清 / 跳过
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors disabled:opacity-30"
          disabled={step === "name" && !animalName.trim()}
        >
          继续 →
        </button>
      </div>
    </motion.div>
  );
}
