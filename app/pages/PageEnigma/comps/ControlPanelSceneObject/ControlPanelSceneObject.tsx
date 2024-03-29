import { useState } from 'react';
import { Transition } from "@headlessui/react";
import { faArrowRightArrowLeft, faCube, faTrash} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, H4, InputVector } from "~/components";

interface ControlPanelSceneObjectProps {
  isShowing:boolean;
}
type XYZ = {
  x: number;
  y: number;
  z: number;
}
export const ControlPanelSceneObject = ({
  isShowing,
}: ControlPanelSceneObjectProps) => {
  const [position, setPosition] = useState<XYZ>({x:0,y:0,z:0});
  const [rotation, setRotation] = useState<XYZ>({x:0,y:0,z:0});
  const [scalar, setScalar] = useState<XYZ>({x:0,y:0,z:0});

  const handlePositionChange = (xyz:XYZ)=>{
    console.log(xyz);
    setPosition(xyz);
  }
  const handleRotationChange = (xyz:XYZ)=>{
    console.log(xyz);
    setRotation(xyz);
  }
  const handleScalarChange = (xyz:XYZ)=>{
    console.log(xyz);
    setScalar(xyz);
  }
  return(
    <Transition
      show={isShowing}
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
          <FontAwesomeIcon icon={faArrowRightArrowLeft}/>
          <p>Swap Object</p>
        </div>
      </div>
      <span className='h-1'/>
      <H4>Position</H4>
      <InputVector
        x={position.x}
        y={position.y}
        z={position.z}
        onChange={handlePositionChange}
      />
      <H4>Rotation</H4>
      <InputVector
        x={rotation.x}
        y={rotation.y}
        z={rotation.z}
        onChange={handleRotationChange}
      />
      <H4>Scale</H4>
      <InputVector
        x={scalar.x}
        y={scalar.y}
        z={scalar.z}
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