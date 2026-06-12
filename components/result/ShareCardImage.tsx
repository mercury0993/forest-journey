"use client";

import { forwardRef } from "react";
import { getAnimalIllustration } from "@/lib/animals";

interface Props {
  animalName: string;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
}

const ShareCardImage = forwardRef<HTMLDivElement, Props>(
  ({ animalName, roleTitle, cardTitle, cardInterpretation }, ref) => {
    const illustration = getAnimalIllustration(animalName);

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

        {/* Animal emoji */}
        <div className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(74,138,74,0.3)]">
          {illustration.emoji}
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
