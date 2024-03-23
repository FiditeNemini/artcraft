import {
  faBackwardFast,
  faBackwardStep,
  faForwardFast,
  faForwardStep,
  faPlay,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ControlsVideo = ()=>{
  return(
    <div className="fixed top-3/4 left-1/2 -translate-x-1/2 -mt-10 bg-ui-panel border-t border-x border-ui-panel-border rounded-t-md px-6 py-2 text-white">
      <div className='flex gap-6 content-center	'>
        <FontAwesomeIcon className="h-6" icon={faBackwardFast} />
        <FontAwesomeIcon className="h-6" icon={faBackwardStep} />
        <FontAwesomeIcon className="h-6" icon={faPlay} />
        <FontAwesomeIcon className="h-6" icon={faForwardStep} />
        <FontAwesomeIcon className="h-6"icon={faForwardFast} />
      </div>
    </div>
  );
};