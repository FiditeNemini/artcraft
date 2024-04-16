import {
  currentTime,
  fullHeight,
  scale,
  stylizeScrollX,
  timelineHeight,
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
        top: 16,
        left: displayTime * 4 * scale.value + 201 - scrollX,
      }}
      onPointerDown={onPointerDown}>
      <div>
        <svg
          width="14"
          height="21"
          viewBox="0 0 14 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 19.5858L1.58578 14.1715C1.21071 13.7965 0.999999 13.2878 0.999999 12.7573L1 2C1 1.44772 1.44771 1 2 1L12 1C12.5523 1 13 1.44772 13 2L13 12.7573C13 13.2878 12.7893 13.7965 12.4142 14.1715L7 19.5858Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div
        className="block bg-white"
        style={{
          width: 2,
          marginTop: -5,
          height: timelineHeight.value - 48,
        }}
      />
    </div>
  );
};
