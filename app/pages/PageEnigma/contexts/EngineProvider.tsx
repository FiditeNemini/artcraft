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
    if (editor !== null) {
      console.warn("Editor Engine already exist");
    } else if (document.getElementById("video-scene") === null) {
      console.error(
        'Editor Engine need a target cavas with the id "video-scene"',
      );
    } else {
      const editor = new Editor();
      editor.initialize({
        dispatchAppUiState
      });
      setEditor(editor);
    }
  }, []);

  return (
    <EngineContext.Provider value={editor}>{children}</EngineContext.Provider>
  );
};
