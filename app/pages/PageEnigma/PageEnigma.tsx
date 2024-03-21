import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  // useState,
} from 'react';

import {
  faChevronLeft,
  faWandSparkles,
} from "@fortawesome/free-solid-svg-icons";


import { Button } from '~/components/Button';
import { ButtonLink } from '~/components/ButtonLink';
import { TopBarInnerContext } from "~/contexts/TopBarInner";
import { SidePanel } from './comp/SidePanel';

import Editor from './js/editor';

export const PageEnigma = () => {
  const { setTopBarInner } = useContext(TopBarInnerContext) || {};

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorRef = useRef<Editor | null>(null);


  const editorCallback = useCallback(() => {
    // handle editorCallback here
  },[]);

  useEffect(() => { //componentDidMount
    editorRef.current = new Editor();
    
    function init(){
      if(editorRef.current!==null){
        //TODO: init with editorRef.current.initialize(editorCallback);
        editorRef.current.initialize();
      }
    }
    
    if(canvasRef!==null){
      init();
    }else{
      setTimeout(init, 500);
    }
  }, []);

  useLayoutEffect(()=>{
    if(setTopBarInner){
      const TopBarInnerButtons = (
        <div className="flex grow justify-between">
          <ButtonLink
            to={"/"}
            variant='secondary'
            icon={faChevronLeft}
          >
            Back to Dashboard
          </ButtonLink>
          <Button
            icon={faWandSparkles}
          >
              Generate Movie
          </Button>
          <span className="w-8"/>
        </div>
      );
      setTopBarInner(TopBarInnerButtons);
    }
  },[setTopBarInner]);

  const handleButtonSave = ()=>{
    editorRef.current?.save();
  }
  const handleButtonLoad = ()=>{
    document.getElementById("load-upload")?.click();
  }
  const handleButtonRender = ()=>{
    editorRef.current?.togglePlayback();
  }
  const handleButtonPlay = ()=>{

  }

  return(
    <div>
      <canvas ref={canvasRef} id="video-scene" width="1280px" height="720px" />
      <SidePanel>
        <Button onClick={handleButtonSave}>Save</Button>
        <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Render</Button>
        <Button onClick={handleButtonPlay}>Play</Button>
        
      </SidePanel>
      <div className="bg-ui-panel w-full h-screen">
        <p className='text-white'>Timeline Panel</p>
        <input style={{ display: 'none' }} type="file" id="load-upload" name="load-upload"></input>
      </div>
    </div>
  );
}