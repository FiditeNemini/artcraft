
import {
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faPlus,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/pro-solid-svg-icons';
import {
  fa3dCylinder,
  fa3dTorus,
  fa3dSphere,
} from '@awesome.me/kit-fde2be5eb0/icons/kit/custom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Controls3D = ()=>{
  return(
    <div 
      className="fixed left-1/2 -translate-x-1/2 bg-ui-panel border-b border-x border-ui-panel-border rounded-b-md px-4 py-2 text-white"
      style={{top: "72px"}}
    >
      <div className='flex gap-4'>
        <FontAwesomeIcon icon={faPlus} />
        <span className="w-0 h-5 border-l border-ui-panel-border" />
        <FontAwesomeIcon icon={fa3dCylinder} />
        <FontAwesomeIcon icon={fa3dTorus} />
        <FontAwesomeIcon icon={fa3dSphere} />
        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
        <FontAwesomeIcon icon={faArrowsRotate} />
        <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
      </div>
    </div>
  );
}