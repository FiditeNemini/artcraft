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
import { ButtonDialogue } from '~/modules/ButtonDialogue';
import { TopBarInnerContext } from "~/contexts/TopBarInner";
import { SidePanel } from '~/modules/SidePanel';
import { LowerPanel } from '~/modules/LowerPanel';

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
      <div className='fixed top-20 left-4'>
        <div className="flex mt-2 gap-2">
          <Button variant="secondary" onClick={handleButtonSave}>Save Scene</Button>
          <ButtonDialogue
            buttonProps={{
              variant: 'secondary',
              label: 'Help'
            }}
            title="Help"
          >
            <p>Do you need help?</p>
            <p>Ask Michael about this project</p>
            <p>Ask Miles about ThreeJS</p>
            <p>Ask Wil about React</p>
          </ButtonDialogue>
        </div>
      </div>
      <SidePanel>
        <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Render</Button>
        <Button onClick={handleButtonPlay}>Play</Button>
      </SidePanel>
      <LowerPanel>
        <p className='text-white'>Timeline Panel</p>
        <input style={{ display: 'none' }} type="file" id="load-upload" name="load-upload"></input>
      </LowerPanel>
    </div>
  );
}