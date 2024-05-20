import { createContext } from "react";
import Editor from "~/pages/PageEnigma/Editor/editor";

export const EngineContext = createContext<Editor | null>(null);
