import { useContext, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

interface LowerPanelPropsI {
  timelineHeight: number;
  children: React.ReactNode;
}

export const LowerPanel = ({ children, timelineHeight }: LowerPanelPropsI) => {
  const [open, setOpen] = useState(false);
  const { setOverTimeline } = useContext(TrackContext);
  const handleOpen = () => {
    setOpen(true);
  };

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
        console.log("over");
        setOverTimeline(true);
      }}
      onPointerLeave={() => setOverTimeline(false)}
    >
      {children}
    </div>
  );
};
