import { LoadingBar, LoadingBarStatus } from "~/components/ui";

import { ContextualImageToolbar } from "~/components/ContextualToolbars";

export const Sandbox = () => {
  return (
    <div>
      <h1>Sandbox</h1>
      <LoadingBar
        progress={50}
        status={LoadingBarStatus.LOADING}
        isShowing={true}
        message="Loading..."
      />

      <LoadingBar
        progress={50}
        position={{ x: 300, y: 200 }}
        status={LoadingBarStatus.LOADING}
        isShowing={true}
        message="Loading..."
      />

      <ContextualImageToolbar position={{ x: 300, y: 600 }} />
    </div>
  );
};
