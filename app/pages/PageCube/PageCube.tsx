import { 
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";

import { Button } from '~/components/Button';
import { ButtonLink } from '~/components/ButtonLink';
import { TopBarInnerContext } from "~/contexts/TopBarInner";

import { SidePanel } from '~/templates/SidePanel';

import { SceneWithCube } from './SceneWithCube';

export const PageCube = () => {
  
  const { setTopBarInner } = useContext(TopBarInnerContext) || {};

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SceneWithCube | null>(null);
  const [{
    x:rotationX,
    y:rotationY
  }, setRotations] = useState<{
    x: number | undefined,
    y:number | undefined
  }>({x:undefined, y:undefined});

  const toggleStopped = ()=>{
   if(sceneRef.current!==null){
    sceneRef.current.stopped = !sceneRef.current.stopped;
   }
  };

  const listeningXYRotation = useCallback((
    {x,y}:{x:number;y:number}
  )=>{
    setRotations({
      x:Math.round(x*100)/100,
      y:Math.round(y*100)/100,
    })
  },[]);

  useEffect(() => { //componentDidMount
    sceneRef.current = new SceneWithCube(listeningXYRotation);
    mountRef.current?.appendChild(sceneRef.current.renderer.domElement);
  
    sceneRef.current.renderer.setAnimationLoop(()=>{
      sceneRef.current?.update();
    });

    // Clean up
    return () => {
      if(sceneRef.current)
        mountRef.current?.removeChild(sceneRef.current.renderer.domElement);
    };
  }, []);

  useLayoutEffect(()=>{
    if(setTopBarInner){
      const BackButton = (
        <ButtonLink
          to={"/"}
          variant='secondary'
          icon={faChevronLeft}
        >
          Back to Dashboard
        </ButtonLink>
      );
      setTopBarInner(BackButton);
    }
  },[setTopBarInner]);

  return (
    <div className="grid grid-cols-12 gap-2	">
      <div className="col-span-6	">
        <div className="MountingPoint" ref={mountRef} />
      </div>
      <div className="col-span-6	">
        <Button onClick={toggleStopped}> STOP </Button>
        <p className='text-white'>Ration X: {rotationX ? rotationX : ""}</p>
        <p className='text-white'>Ration Y: {rotationY ? rotationY : ""}</p>
      </div>
      <SidePanel>
        <p>Side Panel Text</p>
      </SidePanel>
    </div>
  );

};