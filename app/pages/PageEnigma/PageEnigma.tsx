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
    <>
      <canvas ref={canvasRef} id="video-scene" width="1280px" height="720px" />
    </>
  );
}