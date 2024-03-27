import React, { useCallback, useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

interface LowerPanelPropsI {
  timelineHeight: number;
  children: React.ReactNode;
}

export const LowerPanel = ({ children, timelineHeight }: LowerPanelPropsI) => {
  // const [open, setOpen] = useState(false);
  const { setOverTimeline, updateCurrentTime, scale } =
    useContext(TrackContext);

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        updateCurrentTime((Math.round(event.clientX) - 92) / 4 / scale);
      }
    },
    [updateCurrentTime, scale],
  );

  // const handleOpen = () => {
  //   setOpen(true);
  // };

  return (
    <div
      className={[
        "absolute bottom-0",
        "w-screen overflow-auto",
        "border-t border-ui-panel-border",
        "bg-ui-panel",
      ].join(" ")}
      style={{ height: timelineHeight }}
      onPointerOver={() => {
        setOverTimeline(true);
      }}
      onPointerLeave={() => setOverTimeline(false)}
      onPointerDown={onTimelineClick}
    >
      {children}
    </div>
  );
};
