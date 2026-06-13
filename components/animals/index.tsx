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
    for (const [key, Comp] of Object.entries(animalSvgMap)) {
      if (lower.includes(key)) {
        return <Comp width={size} height={size} />;
      }
    }
    return (
      <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>🌿</span>
    );
  }

  return <SvgComp width={size} height={size} />;
}

export { animalSvgMap };
