import { LoadingBar } from "~/components/ui";
import { uiAccess } from "~/signals/uiAccess";

// import { useSignalRenderCounter } from "~/hooks/useSignalRenderCounter";

export const ContextualLoadingBar = () => {
  // TODO: Testing the signal render efficiency
  // useSignalRenderCounter<typeof loadingBar.signal.value>(
  //   "ContextualLoadingBar",
  //   loadingBar.signal,
  // );

  const props = uiAccess.loadingBar.signal.value;

  return <LoadingBar {...props} />;
};
