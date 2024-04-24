import { ReactNode, useEffect, useState } from "react";

import Editor from "~/pages/PageEnigma/js/editor";

import { EngineContext } from "./EngineContext";

interface Props {
  children: ReactNode;
}

export const EngineProvider = ({ children }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    setEditor((curr) => {
      if (curr !== null) {
        console.warn("Editor Engine already exist");
        return curr;
      } else {
        return new Editor();
      }
    });
    // }
  }, []);

  return (
    <EngineContext.Provider value={editor}>{children}</EngineContext.Provider>
  );
};
