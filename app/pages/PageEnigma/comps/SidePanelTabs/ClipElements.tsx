import { useContext } from "react";
import { ClipContext } from "~/contexts/ClipContext/ClipContext";
import { ClipElement } from "./ClipElement";

export const ClipElements = () => {
  const { animationClips } = useContext(ClipContext);

  return (
    <div className="flex flex-wrap">
      {animationClips.map((clip) => {
        return <ClipElement key={clip.id} clip={clip} type="animations" />;
      })}
    </div>
  );
};
