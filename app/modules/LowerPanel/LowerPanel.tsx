import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  faXmark,
  faTimeline,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Button } from '~/components/Button';

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