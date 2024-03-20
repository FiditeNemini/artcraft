import { 
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import Editor from './js/editor';

export const PageEnigma = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => { //componentDidMount
    editorRef.current = new Editor();
    
    function init(){
      if(editorRef.current!==null){
        editorRef.current.initialize();
      }
    }
    
    if(canvasRef!==null){
      init();
    }else{
      setTimeout(init, 500);
    }
  }, []);

  return(
    <div>
      <canvas ref={canvasRef} id="video-scene" width="1280px" height="720px" />
      <div className="absolute top-0 right-0 bg-ui-panel h-screen w-1/5">RIGHT PANEL</div>
      <div className="bg-ui-panel w-full h-screen">Timeline Panel</div>
    </div>
  );
}