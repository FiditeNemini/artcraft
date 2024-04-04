import { Keyframe } from "~/pages/PageEnigma/models/track";
import { filmLength, scale, selectedItem } from "~/pages/PageEnigma/store";
import { useMouseEventsKeyframe } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsKeyframe";
import { useSignals } from "@preact/signals-react/runtime";

interface Props {
  keyframe: Keyframe;
  updateKeyframe: (options: { id: string; offset: number }) => void;
}

export const TrackKeyFrame = ({ keyframe, updateKeyframe }: Props) => {
  useSignals();
  const { onPointerDown, offset } = useMouseEventsKeyframe({
    keyframe,
    max: filmLength.value * 60,
    min: 0,
    updateKeyframe,
  });

  const displayOffset = offset > -1 ? offset : keyframe.offset;

  const selectedKeyframeId =
    (selectedItem.value as Keyframe | null)?.keyframe_uuid ?? "";

  return (
    <button
      className={[
        "block rotate-45 cursor-ew-resize",
        "absolute",
        keyframe.keyframe_uuid === selectedKeyframeId
          ? "bg-keyframe-selected"
          : "bg-keyframe-unselected",
      ].join(" ")}
      style={{
        width: 18,
        height: 18,
        left: displayOffset * 4 * scale.value - 6,
        top: 8,
      }}
      onPointerDown={(event) => onPointerDown(event, "drag")}
      onClick={() => (selectedItem.value = keyframe)}
    />
  );
};
