import {
  canDrop,
  clipLength,
  currPosition,
  dragId,
  overTimeline,
  scale,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

export const DragComponent = () => {
  useSignals();
  const { currX, currY } = currPosition.value;

  return (
    <div
      id={`ani-dnd-${dragId.value}`}
      className={[
        "absolute p-2",
        "rounded-lg",
        !canDrop.value ? "bg-brand-primary" : "bg-brand-secondary-700",
        dragId.value ? "block" : "hidden",
      ].join(" ")}
      style={{
        top: overTimeline.value ? currY - 16 : currY - 32,
        left: currX + 1,
        zIndex: 10000,
        width: overTimeline.value ? clipLength.value * 4 * scale.value : 64,
        height: overTimeline.value ? 32 : 64,
      }}
    />
  );
};
