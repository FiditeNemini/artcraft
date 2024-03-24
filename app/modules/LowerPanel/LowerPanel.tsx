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
      <div className="absolute top-3/4 h-1/4 w-screen border-t border-ui-panel-border bg-ui-panel">
        {children}
      </div>
    </>
  );
};
