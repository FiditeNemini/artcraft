import { useMouseEventsClip } from "./utils/useMouseEventsClip";
import { BaseClip } from "~/models/track";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { useContext, useState } from "react";

interface Props {
  min: number;
  max: number;
  style: "character" | "camera" | "audio" | "objects";
  clip: BaseClip;
  updateClip: (options: { id: string; offset: number; length: number }) => void;
}

export const TrackClip = ({ clip, min, max, style, updateClip }: Props) => {
  const { selectClip, selectedClip, scale } = useContext(TrackContext);
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

  const { length, offset } = state;

  const classes = [
    "absolute",
    clip.id === selectedClip ? `bg-${style}-selected` : `bg-${style}-clip`,
  ];

  return (
    <>
      <div
        className={[...classes, "px-1", "rounded", "text-sm text-white"].join(
          " ",
        )}
        style={{ top: -21, left: offset * 4 * scale + 2 }}
      >
        {clip.name}
      </div>
      <button
        className={[
          ...classes,
          "rounded-l",
          "block h-full",
          clip.id === selectedClip
            ? "border-b-1 border-t-1 border-l-1 border border-r-0 border-white"
            : "",
        ].join(" ")}
        style={{ width: 15, left: offset * 4 * scale, cursor: "w-resize" }}
        onPointerDown={(event) => onPointerDown(event, "left")}
        onClick={() => selectClip(clip.id)}
      />
      <button
        className={[
          ...classes,
          "block h-full",
          clip.id === selectedClip
            ? "border-b-1 border-t-1 border border-l-0 border-r-0 border-white"
            : "",
        ].join(" ")}
        style={{
          width: length * 4 * scale - 30,
          left: offset * 4 * scale + 15,
          cursor: "move",
        }}
        onPointerDown={(event) => onPointerDown(event, "drag")}
        onClick={() => selectClip(clip.id)}
      />
      <button
        className={[
          ...classes,
          "rounded-r",
          "block h-full",
          clip.id === selectedClip
            ? "border-b-1 border-t-1 border-r-1 border border-l-0 border-white"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale + length * 4 * scale - 15,
          cursor: "e-resize",
        }}
        onPointerDown={(event) => onPointerDown(event, "right")}
        onClick={() => selectClip(clip.id)}
      />
    </>
  );
};
