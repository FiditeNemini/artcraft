import { useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { MediaFileAnimationType, TabTitles } from "~/enums";
import { TabTitle } from "../../sharedComps";
import { AnimationTab } from "./subtabAnimation";
import { CharactersTab } from "./subtabCharacters";
import { SubTabButtons } from "../../sharedComps/SubTabButtons";

import {
  demoCharacterItems,
  demoAnimationItems,
} from "~/pages/PageEnigma/signals";

export const CartoonsTab = () => {
  useSignals();

  const [currSubpage, setCurrSubpage] = useState<TabTitles>(
    TabTitles.CHARACTERS,
  );

  return (
    <>
      <TabTitle title={TabTitles.GROUP_CARTOONS} />
      <SubTabButtons
        currSubpage={currSubpage}
        setSubpage={(newPage) => {
          setCurrSubpage(newPage);
        }}
        subPageTitles={[TabTitles.CHARACTERS, TabTitles.ANIMATION]}
      />

      {currSubpage === TabTitles.CHARACTERS && (
        <CharactersTab
          animationType={MediaFileAnimationType.Mixamo}
          demoCharacterItems={demoCharacterItems.value}
        />
      )}
      {currSubpage === TabTitles.ANIMATION && (
        <AnimationTab
          animationType={MediaFileAnimationType.Mixamo}
          demoAnimationItems={demoAnimationItems.value}
        />
      )}
    </>
  );
};
