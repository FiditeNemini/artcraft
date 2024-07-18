import { useState } from "react";

import { MediaFileAnimationType, TabTitles } from "~/enums";
import { TabTitle } from "../../sharedComps";
import { AnimationTab } from "./subtabAnimation";
import { CharactersTab } from "./subtabCharacters";
import { SubTabButtons } from "../../sharedComps/SubTabButtons";

export const AnimeTab = () => {
  const [currSubpage, setCurrSubpage] = useState<TabTitles>(
    TabTitles.CHARACTERS,
  );

  return (
    <>
      <TabTitle title={TabTitles.GROUP_ANIME} />
      <SubTabButtons
        currSubpage={currSubpage}
        setSubpage={(newPage) => {
          setCurrSubpage(newPage);
        }}
        subPageTitles={[TabTitles.CHARACTERS, TabTitles.ANIMATION]}
      />
      {currSubpage === TabTitles.CHARACTERS && (
        <CharactersTab animationType={MediaFileAnimationType.MikuMikuDance} />
      )}
      {currSubpage === TabTitles.ANIMATION && (
        <AnimationTab animationType={MediaFileAnimationType.MikuMikuDance} />
      )}
    </>
  );
};
