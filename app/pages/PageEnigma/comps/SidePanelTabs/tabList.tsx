import { AssetType } from "~/pages/PageEnigma/models";
import { AnimationTab } from "~/pages/PageEnigma/comps/SidePanelTabs/animation/AnimationTab";
import { ObjectsTab } from "~/pages/PageEnigma/comps/SidePanelTabs/objects/ObjectsTab";
import { AudioTab } from "~/pages/PageEnigma/comps/SidePanelTabs/audio/AudioTab";
import { CameraTab } from "~/pages/PageEnigma/comps/SidePanelTabs/camera/CameraTab";
import { ShapeTab } from "~/pages/PageEnigma/comps/SidePanelTabs/shapes/ShapeTab";

export const tabList = [
  {
    icon: "resources/icons/animations.png",
    title: "Animation",
    value: AssetType.ANIMATION,
    component: <AnimationTab />,
  },
  {
    icon: "resources/icons/objects.png",
    title: "Objects",
    value: AssetType.OBJECT,
    component: <ObjectsTab type={AssetType.OBJECT} />,
  },
  {
    icon: "resources/icons/shapes.png",
    title: "Shapes",
    value: AssetType.SHAPE,
    component: <ShapeTab />,
  },
  {
    icon: "resources/icons/characters.png",
    title: "Characters",
    value: AssetType.CHARACTER,
    component: <ObjectsTab type={AssetType.CHARACTER} />,
  },
  {
    icon: "resources/icons/camera.png",
    title: "Camera",
    value: AssetType.CAMERA,
    component: <CameraTab />,
  },
  {
    icon: "resources/icons/audios.png",
    title: "Audio",
    value: AssetType.AUDIO,
    component: <AudioTab />,
  },
];
