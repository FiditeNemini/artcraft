import { ReactNode } from "react";
import { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
  faGlobeSnow,
  faPeople,
  faRabbitRunning,
  faFaceSmileWink,
  faCube,
  faVolume,
  faBrush,
} from "@fortawesome/pro-solid-svg-icons";

import { TabTitles } from "~/enums";
import { ObjectsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/ObjectsTab";
import { AnimationTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/AnimationTab";
import { AudioTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/AudioTab";
import { StylizeTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/StylizeTab/StylizeTab";
import { ExpressionTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/ExpressionTab";
import { CharactersTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/CharactersTab";
import { SetsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/SetsTab";

export interface TabItem {
  icon: FontAwesomeIconProps["icon"];
  title: string;
  component: ReactNode;
}

export const tabList = [
  {
    icon: faGlobeSnow,
    title: TabTitles.SET_OBJECTS,
    component: <SetsTab />,
  },
  {
    icon: faPeople,
    title: TabTitles.CHARACTERS,
    component: <CharactersTab />,
  },
  {
    icon: faRabbitRunning,
    title: TabTitles.ANIMATION,
    component: <AnimationTab />,
  },
  {
    icon: faFaceSmileWink,
    title: TabTitles.EXPRESSIONS,
    component: <ExpressionTab />,
  },
  {
    icon: faCube,
    title: TabTitles.OBJECTS,
    component: <ObjectsTab />,
  },
  {
    icon: faVolume,
    title: TabTitles.AUDIO,
    component: <AudioTab />,
  },
  {
    icon: faBrush,
    title: TabTitles.STYLIZE,
    component: <StylizeTab />,
  },
];
