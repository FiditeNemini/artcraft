import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";
import { uiAccess } from "~/signals/uiAccess";
import { paperWrapperStyles } from "~/components/styles";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Button } from "~/components/ui";

export const ErrorDialog = () => {
  useSignals();
  const props = uiAccess.errorDialogue.signal.value;
  const { isShowing, title, message } = props;

  function handleClose() {
    uiAccess.errorDialogue.hide();
  }
  return (
    <Dialog open={isShowing} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          className={twMerge(
            paperWrapperStyles,
            "w-full max-w-lg space-y-4 p-8",
          )}
        >
          <DialogTitle className="font-bold">{title}</DialogTitle>
          <Description>{message}</Description>
          <div className="flex justify-end gap-4">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
