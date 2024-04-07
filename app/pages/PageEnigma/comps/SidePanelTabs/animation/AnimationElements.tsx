import { AnimationElement } from "./AnimationElement";
import { AssetType } from "~/pages/PageEnigma/models";
import { animationItems } from "~/pages/PageEnigma/store";

export const AnimationElements = () => {
  return (
    <div className="flex flex-wrap gap-3">
      {animationItems.value.map((clip) => (
        <AnimationElement
          key={clip.media_id}
          item={clip}
          type={AssetType.ANIMATION}
        />
      ))}
    </div>
  );
};
