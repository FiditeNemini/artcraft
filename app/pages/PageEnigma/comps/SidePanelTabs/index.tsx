import { Tabs } from "~/modules/Tabs";
import { TabStyling } from "./TabStyling";
import { useCallback, useContext, useState } from "react";
import { ClipContext } from "~/contexts/ClipContext/ClipContext";
import { ClipElement } from "~/pages/PageEnigma/comps/SidePanelTabs/ClipElement";

export const SidePanelTabs = () => {
  const { animationClips } = useContext(ClipContext);

  return (
    <Tabs
      tabs={[
        {
          header: "Animation",
          children: (
            <div className="flex flex-wrap">
              {animationClips.map((clip) => (
                <ClipElement key={clip.id} clip={clip} type="animation" />
              ))}
            </div>
          ),
        },
        {
          header: "Camera",
          children: <p>Camera Tab</p>,
        },
        {
          header: "Audio",
          children: <p>Audio Tab</p>,
        },
        {
          header: "Styling",
          children: <TabStyling />,
        },
      ]}
    />
  );
};
