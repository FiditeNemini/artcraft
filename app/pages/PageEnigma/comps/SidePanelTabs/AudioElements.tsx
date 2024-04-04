import { useContext, useEffect, useState } from "react";
import { AnimationElement } from "./AnimationElement";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useSignals } from "@preact/signals-react/runtime";
import { timelineHeight } from "~/pages/PageEnigma/store";
import { ClipType } from "~/pages/PageEnigma/models/track";

export const AudioElements = () => {
  const { audioClips } = useContext(TrackContext);
  useSignals();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(window.outerHeight - timelineHeight.value);
  }, []);

  return (
    <div className="flex flex-wrap gap-3 overflow-y-auto" style={{ height }}>
      {audioClips.map((clip) => {
        return (
          <AnimationElement
            key={clip.media_id}
            clip={clip}
            type={ClipType.AUDIO}
          />
        );
      })}
    </div>
  );
};
