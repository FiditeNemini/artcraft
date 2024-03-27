import { createContext } from "react";
import Editor from "~/pages/PageEnigma/js/editor";

export const EngineContext = createContext<Editor|null>(null);