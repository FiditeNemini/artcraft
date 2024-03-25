import { useState } from "react";

interface LowerPanelPropsI {
  children: React.ReactNode;
}

export const LowerPanel = ({ children }: LowerPanelPropsI) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div
      className={[
        "absolute bottom-0",
        "h-[260px] w-screen overflow-auto",
        "border-t border-ui-panel-border",
        "bg-ui-panel",
      ].join(" ")}
    >
      {children}
    </div>
  );
};
