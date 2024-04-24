import { AssetType } from "~/pages/PageEnigma/models";
import { ObjectsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ObjectsTab";
import { AnimationTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/AnimationTab";
import { AudioTab } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/AudioTab";
import { StylizeTab } from "./itemTabs/StylizeTab/StylizeTab";
export const tabList = [
  {
    icon: "/resources/icons/characters.png",
    title: "Characters",
    value: AssetType.CHARACTER,
    component: <ObjectsTab type={AssetType.CHARACTER} />,
  },
  {
    icon: "/resources/icons/animations.png",
    title: "Animation",
    value: AssetType.ANIMATION,
    component: <AnimationTab />,
  },
  {
    icon: "/resources/icons/objects.png",
    title: "Objects",
    value: AssetType.OBJECT,
    component: <ObjectsTab type={AssetType.OBJECT} />,
  },
  // {
  //   icon: "/resources/icons/camera.png",
  //   title: "Camera",
  //   value: AssetType.CAMERA,
  //   component: <CameraTab />,
  // },
  {
    icon: "/resources/icons/audios.png",
    title: "Audio",
    value: AssetType.AUDIO,
    component: <AudioTab />,
  },
  {
    icon: "/resources/icons/audios.png",
    title: "AI Stylize",
    value: AssetType.STYLE,
    component: <StylizeTab />,
  },
];
