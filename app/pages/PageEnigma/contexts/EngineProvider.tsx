import { ReactNode, useEffect, useState } from "react";
import { EngineContext } from "./EngineContext";
import Editor from "~/pages/PageEnigma/js/editor";

interface Props {
  children: ReactNode;
}

export const EngineProvider = ({ children }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

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
    if (editor && editor.can_initailize)
      editor.initialize();
  }, [editor]);

  return (
    <EngineContext.Provider value={editor}>
      {children}
    </EngineContext.Provider>
  );
};
