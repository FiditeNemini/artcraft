import { AnimationElement } from "../animation/AnimationElement";
import { AssetType } from "~/pages/PageEnigma/models";
import { audioItems } from "~/pages/PageEnigma/store";

export const AudioElements = () => {
  return (
    <div className="flex flex-wrap gap-3 overflow-y-auto">
      {audioItems.value.map((clip) => {
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
