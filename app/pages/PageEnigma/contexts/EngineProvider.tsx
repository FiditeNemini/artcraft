import { ReactNode, useContext, useEffect, useState } from "react";

import Editor from "~/pages/PageEnigma/js/editor";

import { EngineContext } from "./EngineContext";
import { AppUiContext } from "./AppUiContext";


interface Props {
  children: ReactNode;
}

export const EngineProvider = ({ children }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);

  useEffect(() => {
    //componentDidMount
    if (document.getElementById("video-scene") === null) {
      console.error(
        'Editor Engine need a target canvas with the id "video-scene"',
      );
    } else { 
      setEditor((curr)=>{
        if(curr!==null){
          console.warn("Editor Engine already exist");
          return curr;
        }else{
          return new Editor();
        }
      });
    }
  }, []);

  useEffect(()=>{
    if (editor && editor.can_initailize && dispatchAppUiState!==null){
      console.log("initializing Editor");
      editor.initialize({
        dispatchAppUiState
      });
    }
  }, [editor, dispatchAppUiState]);

  return (
    <EngineContext.Provider value={editor}>
      {children}
    </EngineContext.Provider>
  );
};
