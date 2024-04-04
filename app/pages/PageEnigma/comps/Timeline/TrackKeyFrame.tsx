import { Keyframe } from "~/pages/PageEnigma/models/track";
import { useState } from "react";
import { filmLength, scale, selectedItem } from "~/pages/PageEnigma/store";
import { useMouseEventsKeyframe } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsKeyframe";
import { useSignals } from "@preact/signals-react/runtime";

interface Props {
  keyframe: Keyframe;
  updateKeyframe: (options: { id: string; offset: number }) => void;
}

export const TrackKeyFrame = ({ keyframe, updateKeyframe }: Props) => {
  useSignals();
  const [offset, setOffset] = useState(keyframe.offset);
  const { onPointerDown } = useMouseEventsKeyframe({
    keyframe,
    max: filmLength.value * 60,
    min: 0,
    updateKeyframe,
    setOffset,
  });

  const selectedKeyframeId =
    (selectedItem.value as Keyframe | null)?.keyframe_uuid ?? "";

  return (
    <button
      className={["block rotate-45 cursor-ew-resize", "absolute"].join(" ")}
      style={{
        width: 18,
        height: 18,
        backgroundColor:
          keyframe.keyframe_uuid === selectedKeyframeId ? "#FFDE67" : "#EEEEEE",
        left: offset * 4 * scale.value - 6,
        top: 8,
      }}
      onPointerDown={(event) => onPointerDown(event, "drag")}
      onClick={() => (selectedItem.value = keyframe)}
    />
  );
};
