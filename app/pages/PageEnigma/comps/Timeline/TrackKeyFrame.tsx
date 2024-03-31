import { KeyFrame } from "~/pages/PageEnigma/models/track";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useContext, useState } from "react";
import { scale } from "~/pages/PageEnigma/store";
import { useMouseEventsKeyframe } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsKeyframe";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUpDown } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  min: number;
  max: number;
  style: "character" | "camera" | "audio" | "objects";
  keyframe: KeyFrame;
  updateKeyframe: (options: { id: string; offset: number }) => void;
}

export const TrackKeyFrame = ({
  keyframe,
  min,
  max,
  style,
  updateKeyframe,
}: Props) => {
  const { selectedItem, selectItem } = useContext(TrackContext);
  // const { selectItem, selectedItem } = useContext(TrackContext);
  const [offset, setOffset] = useState(keyframe.offset);
  const { onPointerDown } = useMouseEventsKeyframe({
    keyframe,
    max,
    min,
    updateKeyframe,
    setOffset,
  });

  const classes = [
    "absolute",
    keyframe.keyframe_uuid === selectedItem
      ? `bg-${style}-selected`
      : `bg-${style}-clip`,
  ];

  return (
    <>
      <button
        className={[
          ...classes,
          "rounded-l-lg",
          "block h-full",
          keyframe.keyframe_uuid === selectedItem
            ? "border border-b-2 border-l-2 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value,
          cursor: "w-resize",
        }}
        onPointerDown={(event) => onPointerDown(event, "left")}
        onClick={() => selectItem(keyframe.keyframe_uuid)}
      >
        <FontAwesomeIcon icon={faSortUpDown} />
      </button>
    </>
  );
};
