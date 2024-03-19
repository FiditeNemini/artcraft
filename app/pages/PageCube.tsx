import { 
  useRef,
  useEffect,
  useState,
} from 'react';

import { SceneWithCube } from './Cube';

const PageCube = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneWithCube | null>(null);


  const toggleStopped = ()=>{
   if(sceneRef.current!==null){
    sceneRef.current.stopped = !sceneRef.current.stopped;
   }
  };

  useEffect(() => {
    sceneRef.current = new SceneWithCube();
    mountRef?.current?.appendChild(sceneRef.current.renderer.domElement);
    
    const animate = function () {
      requestAnimationFrame(animate);
      sceneRef?.current?.update();
    };
    animate();

    // Clean up
    return () => {
      if(sceneRef.current)
        mountRef?.current?.removeChild(sceneRef.current.renderer.domElement);
    };
  }, []);

  // useEffect(()=>{
  //   sc
  // }, [stopped])

  return (
    <>
      <div className="Cube" ref={mountRef} />
      <button onClick={toggleStopped}> STOP </button>
    </>
  );

};

export default PageCube;