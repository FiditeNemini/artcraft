import { useContext, useEffect, useState } from "react";
import { ClipElement } from "./ClipElement";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useSignals } from "@preact/signals-react/runtime";
import { timelineHeight } from "~/pages/PageEnigma/store";

export const ClipElements = () => {
  const { animationClips } = useContext(TrackContext);
  useSignals();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(window.outerHeight - timelineHeight.value);
  }, []);

  return (
    <div className="flex flex-wrap overflow-y-auto" style={{ height }}>
      {animationClips.map((clip) => {
        return <ClipElement key={clip.id} clip={clip} type="animations" />;
      })}
    </div>
  );
};
