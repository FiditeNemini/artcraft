import { ReactNode, useEffect, useContext, useState } from "react";

import { AuthenticationContext } from "~/contexts/Authentication";
import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "./EngineContext";
import { signalScene } from "~/store";

import Editor from "~/pages/PageEnigma/js/editor";

interface Props {
  sceneToken?: string
  children: ReactNode;
}

export const EngineProvider = ({
  sceneToken,
  children,
}: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [, dispatchAppUiState] = useContext(AppUiContext);
  const {authState} = useContext(AuthenticationContext);

  useEffect(() => {
    setEditor((curr) => {
      if (curr !== null) {
        console.warn("Editor Engine already exist");
        return curr;
      } else if (authState.sessionToken && authState.userInfo ){
        return new Editor({
          dispatchAppUiState,
          authState,
          signalScene,
        });
      }
      return curr;
    });
    // }
  }, [dispatchAppUiState, authState]);

  useEffect(() => {
    if (editor && editor.can_initialize) {
      editor.initialize({
        sceneToken: sceneToken || ""}
      );
    }
  }, [editor, sceneToken]);

  return (
    <EngineContext.Provider value={editor}>{children}</EngineContext.Provider>
  );
};
