import { ReactNode } from "react";
import { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
  faBrush,
  faCatSpace,
  faFaceSmileWink,
  faGlobeSnow,
  faMountainCity,
  faPresentationScreen,
  faRaygun,
  faSpaghettiMonsterFlying,
  faUserAstronaut,
  faVolume,
} from "@fortawesome/pro-solid-svg-icons";

import { TabTitles } from "~/enums";
import { AudioTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/AudioTab";
import { CreaturesTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/CreaturesTab";
import { ExpressionTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/ExpressionTab";
import { ImagePlanesTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/ImagePlanesTab";
import { ObjectsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/ObjectsTab";
import { SetsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/SetsTab";
import { SkyboxesTab } from "../SidePanelTabs/tabComps/SkyboxesTab";
import { StylizeTab } from "~/pages/PageEnigma/comps/SidePanelTabs/tabComps/StylizeTab/StylizeTab";
import {
  AnimeTab,
  CartoonsTab,
} from "../SidePanelTabs/tabComps/AnimationCharacterComboTabs";

export interface TabItem {
  icon: FontAwesomeIconProps["icon"];
  title: string;
  component: ReactNode;
}

export const tabList = [
  {
    icon: faBrush,
    title: TabTitles.STYLIZE,
    component: <StylizeTab />,
  },
  {
    icon: faMountainCity,
    title: TabTitles.OBJECTS_SETS,
    component: <SetsTab />,
  },
  {
    icon: faGlobeSnow,
    title: TabTitles.SKYBOXES,
    component: <SkyboxesTab />,
  },
  {
    icon: faSpaghettiMonsterFlying,
    title: TabTitles.OBJECTS_CREATURES,
    component: <CreaturesTab />,
  },
  {
    icon: faUserAstronaut,
    title: TabTitles.CHARACTERS_ANIME,
    component: <AnimeTab />,
  },
  {
    icon: faCatSpace,
    title: TabTitles.CHARACTERS_TOONS,
    component: <CartoonsTab />,
  },
  {
    icon: faFaceSmileWink,
    title: TabTitles.EXPRESSIONS,
    component: <ExpressionTab />,
  },
  {
    icon: faRaygun,
    title: TabTitles.OBJECTS,
    component: <ObjectsTab />,
  },
  {
    icon: faPresentationScreen,
    title: TabTitles.IMAGE_PLANE,
    component: <ImagePlanesTab />,
  },
  {
    icon: faVolume,
    title: TabTitles.AUDIO,
    component: <AudioTab />,
  },
];
