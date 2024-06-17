import { ObjectsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ObjectsTab";
import { AnimationTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/AnimationTab";
import { AudioTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/AudioTab";
import { StylizeTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/StylizeTab/StylizeTab";
import { ExpressionTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ExpressionTab";
import { ReactNode } from "react";
import { AssetType } from "~/enums";
import { CharactersTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/CharactersTab";

export interface TabItem {
  icon: string;
  title: string;
  value: AssetType;
  component: ReactNode;
}

export const tabList = [
  {
    icon: "/resources/icons/characters.png",
    title: "Characters",
    value: AssetType.CHARACTER,
    component: <CharactersTab />,
  },
  {
    icon: "/resources/icons/animations.png",
    title: "Animation",
    value: AssetType.ANIMATION,
    component: <AnimationTab />,
  },
  {
    icon: "/resources/icons/expressions.png",
    title: "Expressions",
    value: AssetType.EXPRESSION,
    component: <ExpressionTab />,
  },
  {
    icon: "/resources/icons/objects.png",
    title: "Objects",
    value: AssetType.OBJECT,
    component: <ObjectsTab />,
  },

  {
    icon: "/resources/icons/audios.png",
    title: "Audio",
    value: AssetType.AUDIO,
    component: <AudioTab />,
  },
  {
    icon: "/resources/icons/brush.png",
    title: "AI Stylize",
    value: AssetType.STYLE,
    component: <StylizeTab />,
  },
];
