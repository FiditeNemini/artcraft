import {
  canDrop,
  currPosition,
  dragItem,
  overTimeline,
  scale,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import "./DragComponent.scss";

export const DragComponent = () => {
  useSignals();
  const { currX, currY } = currPosition.value;

  if (!dragItem.value) {
    return null;
  }

  const thumbnail = dragItem.value.thumbnail
    ? dragItem.value.thumbnail
    : `/resources/images/default-covers/${dragItem.value.imageIndex}.webp`;

  return (
    <>
      {overTimeline.value ? (
        <div
          id={`ani-dnd-${dragItem.value.media_id}`}
          className={[
            "absolute p-2",
            "rounded-lg",
            !canDrop.value ? "bg-brand-primary" : "bg-brand-secondary-700",
            "block",
          ].join(" ")}
          style={{
            top: currY - 16,
            left: currX + 1,
            zIndex: 10000,
            width: (dragItem.value.length ?? 0) * 4 * scale.value,
            height: 32,
          }}
        />
      ) : (
        <div
          className="dragging-item-container absolute rounded-lg"
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
      )}
    </>
  );
};
