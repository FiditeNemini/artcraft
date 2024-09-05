import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { FileUploader, IMAGE_FILE_TYPE } from "../FileUploader";
import { Button } from "~/components/ui";

import { paperWrapperStyles } from "~/components/styles";
import { addImageToEngine } from "~/signals/uiEvents";

export const UploadImage = ({
  isOpen,
  closeCallback,
}: {
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  const [assetFile, setAssetFile] = useState<File | null>(null);

  function handleEnter() {
    if (assetFile) {
      addImageToEngine(assetFile);
    }
    closeCallback();
  }
  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <DialogPanel
          className={twMerge(
            paperWrapperStyles,
            "w-full max-w-xl space-y-4 p-8",
          )}
        >
          <DialogTitle className="font-bold">Upload Image</DialogTitle>
          <FileUploader
            title=""
            fileTypes={Object.values(IMAGE_FILE_TYPE)}
            file={assetFile}
            setFile={(file: File | null) => {
              setAssetFile(file);
            }}
          />

          <div className="flex w-full justify-end gap-4 pt-4">
            <Button onClick={closeCallback} variant="secondary">
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
