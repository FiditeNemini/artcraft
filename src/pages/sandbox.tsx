import { LoadingBar, LoadingBarStatus } from "~/components/ui";

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
    </div>
  );
};
