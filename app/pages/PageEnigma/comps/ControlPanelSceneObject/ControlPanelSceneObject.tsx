import { useState } from 'react';
import { Transition } from "@headlessui/react";
import { faArrowRightArrowLeft, faCube, faTrash} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, H4, InputVector } from "~/components";

interface ControlPanelSceneObjectProps {
  isShowing:boolean;
}

export const ControlPanelSceneObject = ({
  isShowing,
}: ControlPanelSceneObjectProps) => {
  const [position, setPosition] = useState<{x:number;y:number;z:number}>({
    x:0,y:0,z:0
  });
  const handlePositionChange = (v:{
    x: number;
    y: number;
    z: number;
  })=>{
    console.log(v);
    setPosition(v);
  }
  return(
    <Transition
      show={true}
      className="absolute bottom-0 right-0 w-fit h-60 m-4 p-2 bg-ui-panel border border-ui-panel-border text-white rounded-lg flex flex-col"
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-1000"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex  justity-between gap-2">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCube}/>
          <p>Scene Object Name</p>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowRightArrowLeft}/>
          <p>Swap Object</p>
        </div>
      </div>
      <H4>Position</H4>
      <InputVector
        x={position.x}
        y={position.y}
        z={position.z}
        onChange={handlePositionChange}
      />
      <H4>Rotation</H4>
      <H4>Scale</H4>
      <div className="flex  justity-between gap-2">
        <Button variant="secondary">Add Keyframe (K)</Button>
        <Button variant="secondary" icon={faTrash} />
      </div>
    </Transition>
  );
}