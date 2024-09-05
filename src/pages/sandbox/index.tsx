import { ContextualToolbarImage } from "~/components/features/KonvaContainer/ContextualToolbarImage";
import { ContextualLoadingBar } from "~/components/features/KonvaContainer/ContextualLoadingBar";

import { useRenderCounter } from "~/hooks/useRenderCounter";

import { ContextualToolbarForm } from "./ContextualToolbarForm";
import { ContextualLoadingBarForm } from "./ContextualLoadingBarForm";

export const Sandbox = () => {
  useRenderCounter("Sandbox");

  return (
    <div className="p-2">
      <ContextualToolbarImage />
      <ContextualLoadingBar />

      <div className="flex flex-col gap-8">
        <h1>Sandbox</h1>
        <ContextualToolbarForm />
        <ContextualLoadingBarForm />
      </div>
    </div>
  );
};
