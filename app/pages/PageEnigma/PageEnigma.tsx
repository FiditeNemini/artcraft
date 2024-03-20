import { 
  useRef,
  useEffect,
  // useState,
  useCallback,
} from 'react';


import { Button } from '~/components/Button';

import Editor from './js/editor';

export const PageEnigma = () => {

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

  const handleButtonSave = ()=>{
    editorRef.current?.save();
  }
  const handleButtonLoad = ()=>{

  }
  const handleButtonRender = ()=>{
    editorRef.current?.togglePlayback();
  }
  const handleButtonPlay = ()=>{

  }

  return(
    <div>
      <canvas ref={canvasRef} id="video-scene" width="1280px" height="720px" />
      <div className="absolute top-0 right-0 bg-ui-panel h-screen w-1/5 pt-20">
        <Button onClick={handleButtonSave}>Save</Button>
        <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Render</Button>
        <Button onClick={handleButtonPlay}>Play</Button>
      </div>
      <div className="bg-ui-panel w-full h-screen">Timeline Panel</div>
    </div>
  );
}