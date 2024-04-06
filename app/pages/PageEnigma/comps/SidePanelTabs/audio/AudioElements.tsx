import { useContext } from "react";
import { AnimationElement } from "../animation/AnimationElement";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { AssetType } from "~/pages/PageEnigma/models";

export const AudioElements = () => {
  const { audioClips } = useContext(TrackContext);

  return (
    <div className="flex flex-wrap gap-3 overflow-y-auto">
      {audioClips.map((clip) => {
        return (
          <AnimationElement
            key={clip.media_id}
            item={clip}
            type={AssetType.AUDIO}
          />
        );
      })}
    </div>
  );
};
