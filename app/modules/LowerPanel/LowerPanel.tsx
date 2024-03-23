import { useState } from 'react'

interface LowerPanelPropsI{
  children: React.ReactNode;
}

export const LowerPanel =({
  children,
}:LowerPanelPropsI)=>{
  const [open, setOpen] = useState(false)
  const handleOpen = ()=>{
    setOpen(true);
  }

  return (<>
    <div className="fixed w-screen top-3/4 h-1/4 bg-ui-panel border-t border-ui-panel-border">
      {children}
    </div>
  </>);
}