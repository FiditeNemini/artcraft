import { useContext } from 'react';
import { Transition } from "@headlessui/react";
import { faArrowRightArrowLeft, faCube, faTrash} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppUiContext } from '../../contexts/AppUiContext';
import { Button, H4, H6, InputVector } from "~/components";

import { XYZ } from '../../datastructures/common';



export const ControlPanelSceneObject = () => {
  const [appUiState, dispatchAppUiState ] = useContext(AppUiContext);

  const position = appUiState?.currentSceneObject.objectVectors.position;
  const rotation = appUiState?.currentSceneObject.objectVectors.rotation;
  const scalar = appUiState?.currentSceneObject.objectVectors.scalar;

  const handlePositionChange = (xyz:XYZ)=>{
    console.log(xyz);
    // setPosition(xyz);
  }
  const handleRotationChange = (xyz:XYZ)=>{
    console.log(xyz);
    // setRotation(xyz);
  }
  const handleScalarChange = (xyz:XYZ)=>{
    console.log(xyz);
    // setScalar(xyz);
  }

  return(
    <Transition
      show={appUiState?.currentSceneObject.isShowing}
      className="absolute bottom-0 right-0 w-fit h-fit m-4 p-2 bg-ui-panel border border-ui-panel-border text-white rounded-lg flex flex-col gap-2"
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-1000"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex justify-between gap-6">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCube}/>
          <p>Object Name</p>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowRightArrowLeft} size="xs" />
          <H6>Swap Object</H6>
        </div>
      </div>
      <span className='h-1'/>
      <H4>Position</H4>
      <InputVector
        x={position?.x || 0}
        y={position?.y || 0}
        z={position?.z || 0}
        onChange={handlePositionChange}
      />
      <H4>Rotation</H4>
      <InputVector
        x={rotation?.x || 0}
        y={rotation?.y || 0}
        z={rotation?.z || 0}
        onChange={handleRotationChange}
      />
      <H4>Scale</H4>
      <InputVector
        x={scalar?.x || 0}
        y={scalar?.y || 0}
        z={scalar?.z || 0}
        onChange={handleScalarChange}
      />
      <span className='h-2'/>
      <div className="flex justify-between gap-2">
        <Button variant="secondary">Add Keyframe (K)</Button>
        <Button variant="secondary" icon={faTrash} />
      </div>
    </Transition>
  );
}