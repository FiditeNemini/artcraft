import {
  canDrop,
  currPosition,
  dragItem,
  overTimeline,
  scale,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import DndAsset from "~/pages/PageEnigma/DragAndDrop/DndAsset";

export const DragComponent = () => {
  useSignals();
  if (!dragItem.value) {
    return null;
  }
  const { currX, currY } = currPosition.value;

  const thumbnail = dragItem.value.thumbnail
    ? dragItem.value.thumbnail
    : `/resources/images/default-covers/${dragItem.value.imageIndex || 0}.webp`;

  if (overTimeline.value) {
    if (canDrop.value && DndAsset.overElement) {
      return (
        <>
          <div
            id={`ani-dnd-${dragItem.value.media_id}`}
            className={[
              "absolute p-2",
              "rounded-lg",
              !canDrop.value
                ? "bg-brand-primary"
                : "bg-dnd-canDrop border-dnd-canDropBorder border border-dashed",
              "block",
            ].join(" ")}
            style={{
              top: DndAsset.overElement.top,
              left: currX + 1,
              zIndex: 10000,
              width: (dragItem.value.length ?? 0) * 4 * scale.value,
              height: 32,
            }}
          />
          <div
            id={`ani-dnd-${dragItem.value.media_id}`}
            className={[
              "absolute p-2",
              "rounded opacity-60",
              "bg-dnd-timeGrid border-2-dnd-timeGridBorder border",
            ].join(" ")}
            style={{
              bottom: timelineHeight.value - 60,
              left: currX + 1,
              zIndex: 10000,
              width: (dragItem.value.length ?? 0) * 4 * scale.value,
              height: 16,
            }}
          />
        </>
      );
    }
    return (
      <div
        id={`ani-dnd-${dragItem.value.media_id}`}
        className={[
          "absolute p-1",
          "rounded-lg text-xs",
          "bg-dnd-cannotDrop",
          "block text-nowrap",
        ].join(" ")}
        style={{
          top: currY - 16,
          left: currX + 1,
          zIndex: 10000,
        }}>
        {DndAsset.notDropText || "Cannot drop here"}
      </div>
    );
  }

  return (
    <div
      className="bg-dnd-wrapper/50 absolute rounded-lg backdrop-blur-sm"
      style={{
        width: 91,
        height: 114,
        top: currY - 57,
        left: currX + 1,
        zIndex: 10000,
      }}>
      <img
        {...{
          crossOrigin: "anonymous",
          src: thumbnail,
        }}
        alt={dragItem.value.name}
        className="rounded-t-lg"
      />
      <div
        className="text-overflow-ellipsis w-full rounded-b-lg px-2 py-1.5 text-center text-sm"
        style={{ backgroundColor: "#39394D" }}>
        {dragItem.value.name || dragItem.value.media_id}
      </div>
    </div>
  );
};
