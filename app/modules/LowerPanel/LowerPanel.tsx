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
    <>
      <div className="absolute bottom-0 min-h-[220px] w-screen border-t border-ui-panel-border bg-ui-panel">
        {children}
      </div>
    </>
  );
};
