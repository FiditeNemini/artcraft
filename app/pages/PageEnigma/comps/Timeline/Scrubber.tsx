import {
  currentTime,
  fullHeight,
  scale,
  stylizeScrollX,
  timelineScrollX,
} from "~/pages/PageEnigma/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/pro-solid-svg-icons";
import { useMouseEventsScrubber } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsScrubber";
import { useSignals } from "@preact/signals-react/runtime";
import { Pages } from "~/pages/PageEnigma/constants/page";

interface Props {
  page: Pages;
}

export const Scrubber = ({ page }: Props) => {
  useSignals();
  const { onPointerDown, time } = useMouseEventsScrubber();
  const displayTime = time === -1 ? currentTime.value : time;
  const scrollX =
    page === Pages.EDIT ? timelineScrollX.value : stylizeScrollX.value;

  if (displayTime * 4 * scale.value - scrollX < 0) {
    return null;
  }

  return (
    <div
      className="absolute flex cursor-ew-resize flex-col items-center text-brand-primary"
      style={{
        top: 8,
        left: displayTime * 4 * scale.value + 225 - scrollX,
      }}
      onPointerDown={onPointerDown}>
      <div>
        <FontAwesomeIcon icon={faSortDown} className="h-5 text-brand-primary" />
      </div>
      <div
        className="block bg-brand-primary"
        style={{
          width: 2,
          marginTop: -5,
          height: fullHeight.value,
        }}
      />
    </div>
  );
};
