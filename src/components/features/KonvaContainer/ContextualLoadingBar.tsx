import { useSignals } from "@preact/signals-react/runtime";

import { LoadingBar } from "~/components/ui";
import { loadingBar } from "~/signals/konvaContextuals";

export const ContextualLoadingBar = () => {
  useSignals();
  //console.log("ContextualLoadingBar");
  const props = loadingBar.signal.value;

  return <LoadingBar {...props} />;
};
