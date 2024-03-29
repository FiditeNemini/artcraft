import { BaseKeyFrame } from "~/pages/PageEnigma/models/track";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useContext, useState } from "react";
import { scale } from "~/pages/PageEnigma/store";

interface Props {
  min: number;
  max: number;
  style: "character" | "camera" | "audio" | "objects";
  keyFrame: BaseKeyFrame;
  updateClip: (options: { id: string; offset: number; length: number }) => void;
}

export const TrackKeyFrame = ({
  keyFrame,
  // min,
  // max,
  style,
  // updateClip,
}: Props) => {
  const { selectedClip } = useContext(TrackContext);
  // const { selectClip, selectedClip } = useContext(TrackContext);
  const [state, setState] = useState({
    offset: keyFrame.offset,
  });
  // const { onPointerDown } = useMouseEventsClip(
  //   keyFrame,
  //   max,
  //   min,
  //   updateClip,
  //   setState,
  // );

  const { offset } = state;

  const classes = [
    "absolute",
    keyFrame.id === selectedClip ? `bg-${style}-selected` : `bg-${style}-clip`,
  ];

  return (
    <>
      <div
        className={[
          ...classes,
          "px-[6px] py-[3px]",
          "rounded",
          "prevent-select text-xs font-medium text-white",
        ].join(" ")}
        style={{ top: -28, left: offset * 4 * scale.value + 2 }}
      >
        {keyFrame.name}
      </div>
      <button
        className={[
          ...classes,
          "rounded-l-lg",
          "block h-full",
          keyFrame.id === selectedClip
            ? "border border-b-2 border-l-2 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value,
          cursor: "w-resize",
        }}
        // onPointerDown={(event) => onPointerDown(event, "left")}
        // onClick={() => selectClip(clip.id)}
      />
      <button
        className={[
          ...classes,
          "block h-full",
          keyFrame.id === selectedClip
            ? "border border-b-2 border-l-0 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: length * 4 * scale.value - 30,
          left: offset * 4 * scale.value + 15,
          cursor: "move",
        }}
        // onPointerDown={(event) => onPointerDown(event, "drag")}
        // onClick={() => selectClip(clip.id)}
      />
      <button
        className={[
          ...classes,
          "rounded-r-lg",
          "block h-full",
          keyFrame.id === selectedClip
            ? "border border-b-2 border-l-0 border-r-2 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value + length * 4 * scale.value - 15,
          cursor: "e-resize",
        }}
        // onPointerDown={(event) => onPointerDown(event, "right")}
        // onClick={() => selectClip(clip.id)}
      />
    </>
  );
};
