import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { FileUploader, VIDEO_FILE_TYPE } from "../FileUploader";
import { Button } from "~/components/ui";

import { paperWrapperStyles } from "~/components/styles";
import { dispatchUiEvents } from "~/signals/uiEvents";
import { QuickTrimVideoPlayer } from "./QuickTrimVideoPlayer";

export const UploadVideo = ({
  isOpen,
  closeCallback,
}: {
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  const [assetFile, setAssetFile] = useState<File | null>(null);
  function handleClose() {
    setAssetFile(null);
    closeCallback();
  }

  function handleEnter() {
    if (assetFile) {
      dispatchUiEvents.addVideoToEngine(assetFile);
    }
    handleClose();
  }

  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <DialogPanel
          className={twMerge(
            paperWrapperStyles,
            "flex w-full max-w-5xl flex-col gap-4 px-6 py-4",
          )}
        >
          <DialogTitle className="font-bold">Upload Video</DialogTitle>
          <div className="flex flex-col rounded-lg border-2 border-dashed border-ui-border">
            <FileUploader
              title=""
              fileTypes={Object.values(VIDEO_FILE_TYPE)}
              file={assetFile}
              setFile={async (file: File | null) => {
                setAssetFile(file);
              }}
            />
            {assetFile && <QuickTrimVideoPlayer file={assetFile} />}
          </div>
          <div className="flex w-full justify-end gap-4">
            <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleEnter} disabled={assetFile === null}>
              Enter
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
