import { useMouseEventsClip } from "./utils/useMouseEventsClip";
import { useState } from "react";
import { scale } from "~/pages/PageEnigma/store";
import { Clip } from "~/pages/PageEnigma/models/track";
import { selectedItem } from "~/pages/PageEnigma/store/selectedItem";

interface Props {
  min: number;
  max: number;
  style: "character" | "camera" | "audio" | "objects";
  clip: Clip;
  updateClip: (options: { id: string; offset: number; length: number }) => void;
}

export const TrackClip = ({ clip, min, max, style, updateClip }: Props) => {
  const [state, setState] = useState({
    length: clip.length,
    offset: clip.offset,
  });
  const { onPointerDown } = useMouseEventsClip(
    clip,
    max,
    min,
    updateClip,
    setState,
  );

  const selectedClipId = (selectedItem.value as Clip | null)?.clip_uuid ?? "";

  const { length, offset } = state;

  const classes = [
    "absolute",
    clip.clip_uuid === selectedClipId
      ? `bg-${style}-selected`
      : `bg-${style}-clip`,
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
        {clip.name}
      </div>
      <button
        className={[
          ...classes,
          "rounded-l-lg",
          "block h-full",
          clip.clip_uuid === selectedClipId
            ? "border border-b-2 border-l-2 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value,
          cursor: "w-resize",
        }}
        onPointerDown={(event) => onPointerDown(event, "left")}
        onClick={() => (selectedItem.value = clip)}
      />
      <button
        className={[
          ...classes,
          "block h-full",
          clip.clip_uuid === selectedClipId
            ? "border border-b-2 border-l-0 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: length * 4 * scale.value - 30,
          left: offset * 4 * scale.value + 15,
          cursor: "move",
        }}
        onPointerDown={(event) => onPointerDown(event, "drag")}
        onClick={() => (selectedItem.value = clip)}
      />
      <button
        className={[
          ...classes,
          "rounded-r-lg",
          "block h-full",
          clip.clip_uuid === selectedClipId
            ? "border border-b-2 border-l-0 border-r-2 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value + length * 4 * scale.value - 15,
          cursor: "e-resize",
        }}
        onPointerDown={(event) => onPointerDown(event, "right")}
        onClick={() => (selectedItem.value = clip)}
      />
    </>
  );
};
