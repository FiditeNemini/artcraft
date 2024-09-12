import { useCallback, useState } from "react";
import { signal } from "@preact/signals-react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import {
  dialogBackgroundStyles,
  paperWrapperStyles,
} from "~/components/styles";
import { Button } from "~/components/ui";

import { QuickTrimVideoUploader, TrimData } from "./QuickTrimVideoUploader";
import { ButtonSubmitAdd } from "./ButtonSumbitAdd";

import { DialogAddMediaStatuses } from "./enums";
import { LoadingScreens } from "./LoadingScreens";
// import { useRenderCounter } from "~/hooks/useRenderCounter";

const initialState = {
  file: null,
  dialogStatus: DialogAddMediaStatuses.STAGING_FILE,
};
export const DialogAddVideo = ({
  isOpen,
  closeCallback,
}: {
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  // useRenderCounter("DialogAddVideo");

  const [{ file, dialogStatus }, setStates] = useState<{
    file: File | null;
    dialogStatus: DialogAddMediaStatuses;
  }>(initialState);
  const trimData = signal<TrimData | undefined>(undefined);

  const handleClose = useCallback(() => {
    closeCallback();
  }, [closeCallback]);

  const changeDialogStatus = useCallback(
    (newStatus: DialogAddMediaStatuses) => {
      setStates((curr) => ({ ...curr, dialogStatus: newStatus }));
      if (newStatus === DialogAddMediaStatuses.FILE_RECORD_RECEIVED) {
        setTimeout(handleClose, 1000);
        setTimeout(() => setStates(initialState), 1100);
      }
    },
    [handleClose],
  );

  return (
    <Dialog
      open={isOpen}
      onClose={closeCallback}
      unmount={true}
      className="relative z-50"
    >
      <div className={dialogBackgroundStyles}>
        <DialogPanel className="w-full max-w-5xl">
          <div
            className={twMerge(
              paperWrapperStyles,
              "flex w-full max-w-5xl flex-col gap-4 px-6 py-4",
            )}
            style={{ height: "calc(100vh - 200px)" }}
          >
            <DialogTitle className="font-bold">Upload Video</DialogTitle>
            {dialogStatus === DialogAddMediaStatuses.STAGING_FILE && (
              <>
                <QuickTrimVideoUploader
                  file={file}
                  onFileStaged={(file) => {
                    setStates((curr) => ({ ...curr, file }));
                  }}
                  trimData={trimData}
                  onTrimChange={(newTrimData: TrimData) => {
                    trimData.value = newTrimData;
                  }}
                />
                <span className="grow" />
                <div className="flex w-full justify-end gap-4">
                  <Button onClick={handleClose} variant="secondary">
                    Cancel
                  </Button>

                  <ButtonSubmitAdd
                    file={file}
                    trimData={trimData}
                    onStatusChanged={changeDialogStatus}
                  />
                </div>
              </>
            )}
            <LoadingScreens currStatus={dialogStatus} />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
