import { useContext } from "react";
import { ClipElement } from "./ClipElement";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

export const ClipElements = () => {
  const { animationClips } = useContext(TrackContext);

  return (
    <div className="flex flex-wrap">
      {animationClips.map((clip) => {
        return <ClipElement key={clip.id} clip={clip} type="animations" />;
      })}
    </div>
  );
};
