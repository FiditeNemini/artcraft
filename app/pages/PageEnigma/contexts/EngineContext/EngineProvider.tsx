import { ReactNode, useEffect, useState } from "react";
import { EngineContext } from "./EngineContext";

import Editor from "~/pages/PageEnigma/Editor/editor";

interface Props {
  sceneToken?: string;
  children: ReactNode;
}

export const EngineProvider = ({ sceneToken, children }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    setEditor((curr) => {
      if (curr !== null) {
        console.warn("Editor Engine already exist");
        return curr;
      }
      return new Editor();
    });
  }, []);

  useEffect(() => {
    if (editor && editor.can_initialize) {
      editor.initialize({
        sceneToken: sceneToken || "",
      });
    }
  }, [editor, sceneToken]);

  return (
    <EngineContext.Provider value={editor}>{children}</EngineContext.Provider>
  );
};
