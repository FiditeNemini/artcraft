import { useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";
import { MediaFileAnimationType, TabTitles } from "~/enums";
import { TabTitle } from "../../sharedComps";
import { AnimationTab } from "./subpageAnimation";
import { CharactersTab } from "./subpageCharacters";
import {
  demoCharacterItems,
  demoAnimationItems,
} from "~/pages/PageEnigma/signals";

export const CartoonsTab = () => {
  useSignals();

  const [subPage, setSubPage] = useState<
    TabTitles.ANIMATION | TabTitles.CHARACTERS
  >(TabTitles.CHARACTERS);

  return (
    <>
      <TabTitle title="Cartoon Characters & Animations" />

      <div className="mx-4">
        <button
          className={twMerge(
            "h-10 w-1/2 cursor-pointer rounded-l-lg bg-brand-secondary p-2 text-sm font-medium transition-all",
            subPage === TabTitles.CHARACTERS
              ? "bg-brand-primary"
              : "hover:bg-brand-secondary-800",
          )}
          disabled={subPage === TabTitles.CHARACTERS}
          onClick={() => setSubPage(TabTitles.CHARACTERS)}
        >
          Characters
        </button>
        <button
          className={twMerge(
            "h-10 w-1/2 cursor-pointer rounded-r-lg bg-brand-secondary p-2 text-sm font-medium transition-all",
            subPage === TabTitles.ANIMATION
              ? "bg-brand-primary"
              : "hover:bg-brand-secondary-800",
          )}
          disabled={subPage === TabTitles.ANIMATION}
          onClick={() => {
            setSubPage(TabTitles.ANIMATION);
          }}
        >
          Animations
        </button>
      </div>
      {subPage === TabTitles.CHARACTERS && (
        <CharactersTab
          animationType={MediaFileAnimationType.Mixamo}
          demoCharacterItems={demoCharacterItems.value}
        />
      )}
      {subPage === TabTitles.ANIMATION && (
        <AnimationTab
          animationType={MediaFileAnimationType.Mixamo}
          demoAnimationItems={demoAnimationItems.value}
        />
      )}
    </>
  );
};
