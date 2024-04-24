import { Keyframe } from "~/pages/PageEnigma/models";
import { filmLength, scale, selectedItem } from "~/pages/PageEnigma/store";
import { useMouseEventsKeyframe } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsKeyframe";
import { useSignals } from "@preact/signals-react/runtime";
import { useContext } from "react";
import { ToasterContext } from "~/contexts/ToasterContext";

interface Props {
  keyframe: Keyframe;
  updateKeyframe: (options: {
    id: string;
    offset: number;
    addToast: (type: "error" | "warning" | "success", message: string) => void;
  }) => void;
}

export const TrackKeyFrame = ({ keyframe, updateKeyframe }: Props) => {
  useSignals();
  const { addToast } = useContext(ToasterContext);
  const { onPointerDown, offset } = useMouseEventsKeyframe({
    keyframe,
    max: filmLength.value * 60,
    min: 0,
    updateKeyframe,
    addToast,
  });

  const displayOffset = offset > -1 ? offset : keyframe.offset;

  const selectedKeyframeId =
    (selectedItem.value as Keyframe | null)?.keyframe_uuid ?? "";

  return (
    <button
      className={[
        "top-[11px] block h-[14px] w-[14px] rotate-45 cursor-ew-resize",
        "absolute",
        keyframe.keyframe_uuid === selectedKeyframeId
          ? "bg-keyframe-selected"
          : "bg-keyframe-unselected",
      ].join(" ")}
      style={{
        left: displayOffset * 4 * scale.value - 5,
      }}
      onPointerDown={(event) => onPointerDown(event, "drag")}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        selectedItem.value = keyframe;
      }}
    />
  );
};
