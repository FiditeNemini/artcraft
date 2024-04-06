import { useContext } from "react";
import { AnimationElement } from "./AnimationElement";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { AssetType } from "~/pages/PageEnigma/models";

export const AnimationElements = () => {
  const { animationClips } = useContext(TrackContext);

  return (
    <div className="flex flex-wrap gap-3">
      {animationClips.map((clip) => (
        <AnimationElement
          key={clip.media_id}
          item={clip}
          type={AssetType.ANIMATION}
        />
      ))}
    </div>
  );
};
