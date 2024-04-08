import {
  canDrop,
  currPosition,
  dragItem,
  overTimeline,
  scale,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

export const DragComponent = () => {
  useSignals();
  const { currX, currY } = currPosition.value;

  if (!dragItem.value) {
    return null;
  }

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
          className="absolute rounded-lg"
          style={{
            width: 91,
            height: 114,
            top: currY - 57,
            left: currX + 1,
            zIndex: 10000,
          }}
        >
          <img
            src={dragItem.value.thumbnail}
            alt={dragItem.value.name}
            className="rounded-t-lg"
          />
          <div
            className="w-full rounded-b-lg py-1 text-center text-sm"
            style={{ backgroundColor: "#39394D" }}
          >
            {dragItem.value.name}
          </div>
        </div>
      )}
    </>
  );
};
