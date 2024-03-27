import { ReactNode, useEffect, useRef, useState } from "react";
import { EngineContext } from "./EngineContext";
import Editor from "~/pages/PageEnigma/js/editor";

interface Props {
  children: ReactNode;
}

export const EngineProvider = ({ children }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

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
      editor.initialize();
      setEditor(editor);
    }
  }, []);

  return (
    <EngineContext.Provider value={editor}>{children}</EngineContext.Provider>
  );
};
