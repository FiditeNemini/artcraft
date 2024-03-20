import { 
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { SceneWithCube } from './SceneWithCube';

export const PageCube = () => {
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

  useEffect(() => {
    sceneRef.current = new SceneWithCube(listeningXYRotation);
    mountRef.current?.appendChild(sceneRef.current.renderer.domElement);
    
    const animate = function () {
      requestAnimationFrame(animate);
      sceneRef.current?.update();
    };
    animate();

    // Clean up
    return () => {
      if(sceneRef.current)
        mountRef.current?.removeChild(sceneRef.current.renderer.domElement);
    };
  }, []);

  return (
    <>
      <div className="Cube" ref={mountRef} />
      <button onClick={toggleStopped}> STOP </button>
      <p>{rotationX ? rotationX : ""}</p>
      <p>{rotationY ? rotationY : ""}</p>
    </>
  );

};