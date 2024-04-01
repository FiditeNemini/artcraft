import { useMouseEventsClip } from "./utils/useMouseEventsClip";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useCallback, useContext, useState } from "react";
import { scale } from "~/pages/PageEnigma/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/pro-solid-svg-icons";
import { Clip } from "~/pages/PageEnigma/models/track";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

interface Props {
  min: number;
  max: number;
  style: "character" | "camera" | "audio" | "objects";
  clip: Clip;
  updateClip: (options: { id: string; offset: number; length: number }) => void;
}

export const TrackClip = ({ clip, min, max, style, updateClip }: Props) => {
  const { selectItem, selectedItem } = useContext(TrackContext);
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

  const onPlayClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.PLAY_CLIP,
        data: clip,
      });
    },
    [clip],
  );

  const classes = [
    "absolute",
    clip.clip_uuid === selectedItem
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
          clip.clip_uuid === selectedItem
            ? "border border-b-2 border-l-2 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value,
          cursor: "w-resize",
        }}
        onPointerDown={(event) => onPointerDown(event, "left")}
        onClick={() => selectItem(clip.clip_uuid)}
      />
      <button
        className={[
          ...classes,
          "block h-full",
          clip.clip_uuid === selectedItem
            ? "border border-b-2 border-l-0 border-r-0 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: length * 4 * scale.value - 30,
          left: offset * 4 * scale.value + 15,
          cursor: "move",
        }}
        onPointerDown={(event) => onPointerDown(event, "drag")}
        onClick={() => selectItem(clip.clip_uuid)}
      />
      <button
        className={[
          ...classes,
          "rounded-r-lg",
          "block h-full",
          clip.clip_uuid === selectedItem
            ? "border border-b-2 border-l-0 border-r-2 border-t-2 border-white focus-visible:outline-0"
            : "",
        ].join(" ")}
        style={{
          width: 15,
          left: offset * 4 * scale.value + length * 4 * scale.value - 15,
          cursor: "e-resize",
        }}
        onPointerDown={(event) => onPointerDown(event, "right")}
        onClick={() => selectItem(clip.clip_uuid)}
      />
      {/*{selectedItem === clip.clip_uuid && (*/}
      {/*  <button*/}
      {/*    className="absolute flex h-full items-center justify-center"*/}
      {/*    style={{*/}
      {/*      width: length * 4 * scale.value,*/}
      {/*      left: offset * 4 * scale.value,*/}
      {/*      zIndex: 2000,*/}
      {/*    }}*/}
      {/*    onPointerDown={onPlayClick}*/}
      {/*  >*/}
      {/*    <FontAwesomeIcon icon={faPlay} />*/}
      {/*  </button>*/}
      {/*)}*/}
    </>
  );
};
