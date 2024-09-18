import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { FileUploader } from "../FileUploader";
import { Button } from "~/components/ui";

import { IMAGE_FILE_TYPE } from "~/constants/fileTypeEnums";

import {
  paperWrapperStyles,
  dialogBackgroundStyles,
} from "~/components/styles";
import { dispatchUiEvents } from "~/signals/uiEvents/";

export const DialogAddImage = ({
  stagedImage = null,
  isOpen,
  closeCallback,
}: {
  stagedImage?: File | null;
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const previouslyStagedImageRef = useRef<File | null>(null);

  const currFile =
    stagedImage &&
    stagedImage !== assetFile &&
    stagedImage !== previouslyStagedImageRef.current
      ? stagedImage
      : assetFile;
  if (previouslyStagedImageRef.current !== stagedImage) {
    previouslyStagedImageRef.current = stagedImage;
  }

  function handleClose() {
    setAssetFile(null);
    closeCallback();
  }

  function handleEnter() {
    if (currFile) {
      dispatchUiEvents.addImageToEngine(currFile);
    }
    handleClose();
  }
  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className={dialogBackgroundStyles}>
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
            file={currFile}
            setFile={(file: File | null) => {
              setAssetFile(file);
            }}
          />
          {currFile && (
            <div className="relative flex items-center justify-center rounded-xl bg-ui-border">
              <label className="absolute left-0 top-0 rounded-br-xl rounded-tl-xl border border-ui-border bg-white p-2 shadow-md">
                Preview
              </label>
              <img
                src={URL.createObjectURL(currFile)}
                className="border border-dashed border-white"
              />
            </div>
          )}
          <div className="flex w-full justify-end gap-4 pt-4">
            <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleEnter} disabled={currFile === null}>
              Enter
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
