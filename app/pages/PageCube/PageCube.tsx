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
    setRotations({x:x, y:y})
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
    <>
      <div className="Cube" ref={mountRef} />
      <Button onClick={toggleStopped}> STOP </Button>
      <p>{rotationX ? rotationX : ""}</p>
      <p>{rotationY ? rotationY : ""}</p>
    </>
  );

};