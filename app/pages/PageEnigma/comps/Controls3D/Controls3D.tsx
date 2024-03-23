import {
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faPlus,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
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
        <img className="w-5" src="/resources/svgs/torus.svg" alt="make torus" />
        <img className="w-5" src="/resources/svgs/cylinder.svg" alt="make cynlinder" />
        <img className="w-5" src="/resources/svgs/sphere.svg" alt="make sphere" />
        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
        <FontAwesomeIcon icon={faArrowsRotate} />
        <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
      </div>
    </div>
  );
}