import { useState } from "react";

interface LowerPanelPropsI {
  timelineHeight: number;
  children: React.ReactNode;
}

export const LowerPanel = ({ children, timelineHeight }: LowerPanelPropsI) => {
  const [open, setOpen] = useState(false);
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
    >
      {children}
    </div>
  );
};
