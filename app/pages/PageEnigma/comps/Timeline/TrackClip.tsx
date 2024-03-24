import { useMouseEvents } from "./utils/useMouseEvents";
import { BaseClip } from "~/models/track";
import { TrackContext } from "~/contexts/TrackContext";
import { useContext } from "react";

interface Props {
  min: number;
  max: number;
  clip: BaseClip;
  updateClip: (id: string, offset: number, length: number) => void;
  selected?: boolean;
}

export const TrackClip = ({ clip, min, max, updateClip }: Props) => {
  const { selectClip } = useContext(TrackContext);
  const {
    onPointerDown,
    onPointerUp,
    onMouseLeave,
    onMouseMove,
    offset,
    length,
  } = useMouseEvents(clip, max, min, updateClip);

  if (clip.selected) {
    console.log("selected", clip);
  }
  return (
    <>
      <div
        className="absolute text-sm text-white"
        style={{ top: -20, left: offset }}
      >
        {clip.name}
      </div>
      <button
        className={`bg-character-${clip.selected ? "selected" : "unselected"} absolute block h-full rounded-l`}
        style={{ width: 15, left: offset, cursor: "w-resize" }}
        onPointerDown={(event) => onPointerDown(event, "left")}
        onPointerUp={onPointerUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onClick={() => selectClip({ type: "animations", id: clip.id })}
      />
      <button
        className={`bg-character-${clip.selected ? "selected" : "unselected"} absolute block h-full`}
        style={{ width: length - 30, left: offset + 15, cursor: "move" }}
        onPointerDown={(event) => onPointerDown(event, "drag")}
        onPointerUp={onPointerUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onClick={() => selectClip({ type: "animations", id: clip.id })}
      />
      <button
        className={`bg-character-${clip.selected ? "selected" : "unselected"} absolute block h-full rounded-r`}
        style={{ width: 15, left: offset + length - 15, cursor: "e-resize" }}
        onPointerDown={(event) => onPointerDown(event, "right")}
        onPointerUp={onPointerUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onClick={() => selectClip({ type: "animations", id: clip.id })}
      />
    </>
  );
};
