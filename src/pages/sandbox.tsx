import { LoadingBar } from "~/components/ui";

export const Sandbox = () => {
  return (
    <div>
      <h1>Sandbox</h1>
      <LoadingBar progress={50} isShowing={true} message="Loading..." />
    </div>
  );
};
