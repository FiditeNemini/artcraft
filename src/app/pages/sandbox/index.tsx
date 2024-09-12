import { ContextualToolbarImage } from "~/KonvaRootComponent/ContextualToolbarImage";
import { ContextualLoadingBar } from "~/KonvaRootComponent/ContextualLoadingBar";

import { DialogError } from "~/components/features";

import { useRenderCounter } from "~/hooks/useRenderCounter";

import { ContextualToolbarForm } from "./ContextualToolbarForm";
import { ContextualLoadingBarForm } from "./ContextualLoadingBarForm";
import { ErrorDialogForm } from "./ErrorDialogForm";

import { ButtonTestTester } from "./ButtonTestTester";

export const Sandbox = () => {
  useRenderCounter("Sandbox");

  return (
    <div className="p-2">
      <div className="flex flex-col gap-8">
        <h1>Sandbox</h1>
        <ButtonTestTester />
        <ContextualToolbarForm />
        <ContextualLoadingBarForm />
        <ErrorDialogForm />
      </div>

      <ContextualToolbarImage />
      <ContextualLoadingBar />
      <DialogError />
    </div>
  );
};
