import { Keyframe } from "~/pages/PageEnigma/models/track";
import { useState } from "react";
import { scale, selectedItem } from "~/pages/PageEnigma/store";
import { useMouseEventsKeyframe } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsKeyframe";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUpDown } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  min: number;
  max: number;
  keyframe: Keyframe;
  updateKeyframe: (options: { id: string; offset: number }) => void;
}

export const TrackKeyFrame = ({
  keyframe,
  min,
  max,
  updateKeyframe,
}: Props) => {
  const [offset, setOffset] = useState(keyframe.offset);
  const { onPointerDown } = useMouseEventsKeyframe({
    keyframe,
    max,
    min,
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
