import {
  ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import { EngineContext } from "./EngineContext";
import Editor from "~/pages/PageEnigma/js/editor";


interface Props{
  children:ReactNode;
}

export const EngineProvider = ({ children }: Props)=>{
  const editorRef = useRef<Editor | null>(null);

  useLayoutEffect(() => {
    //componentDidMount
    if (editorRef.current == null) {
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