import {
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { EngineContext } from "./EngineContext";
import Editor from "~/pages/PageEnigma/js/editor";


interface Props{
  children:ReactNode;
}

export const EngineProvider = ({ children }: Props)=>{
  const editorRef = useRef<Editor | null>(null);


  useEffect(() => {
    //componentDidMount
    if (editorRef.current !== null ) {
      console.warn('Editor Engine already exist');
    }else if (document.getElementById("video-scene") === null){
      console.error('Editor Engine need a target cavas with the id "video-scene"');
    }else{
      editorRef.current = new Editor();
      editorRef.current.initialize();
    }
  }, []);

  return(
    <EngineContext.Provider value={editorRef.current}>
      {children}
    </EngineContext.Provider>
  );
}

