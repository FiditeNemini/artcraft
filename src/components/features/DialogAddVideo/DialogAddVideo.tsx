import { useCallback, useRef, useState, useEffect } from "react";
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

import { ApiResponse } from "~/Classes/ApiManager/ApiManager";
import { MediaFile } from "~/Classes/ApiManager/models/MediaFile";

const initialState = {
  file: null,
  dialogStatus: DialogAddMediaStatuses.STAGING_FILE,
};
export const DialogAddVideo = ({
  stagedVideo = null,
  isOpen,
  closeCallback,
  onUploadedVideo,
}: {
  stagedVideo?: File | null;
  isOpen: boolean;
  closeCallback: () => void;
  onUploadedVideo: (response: ApiResponse<MediaFile>) => void;
}) => {
  const [{ file, dialogStatus }, setStates] = useState<{
    file: File | null;
    dialogStatus: DialogAddMediaStatuses;
  }>(initialState);
  const previouslyStagedVideoRef = useRef<File | null>(null);

  const currFile =
    stagedVideo &&
    stagedVideo !== file &&
    stagedVideo !== previouslyStagedVideoRef.current
      ? stagedVideo
      : file;
  if (previouslyStagedVideoRef.current !== stagedVideo) {
    previouslyStagedVideoRef.current = stagedVideo;
  }

  const trimDataRef = useRef(signal<TrimData | undefined>(undefined));
  const trimData = trimDataRef.current;

  const handleClose = useCallback(() => {
    closeCallback();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      //this reset the modal on close
      setStates(initialState);
      trimData.value = {
        trimStartMs: 0,
        trimEndMs: 0,
      };
    }
  }, [isOpen]);

  const changeDialogStatus = useCallback(
    (newStatus: DialogAddMediaStatuses) => {
      setStates((curr) => ({ ...curr, dialogStatus: newStatus }));
      if (newStatus === DialogAddMediaStatuses.FILE_RECORD_RECEIVED) {
        setTimeout(handleClose, 1000);
      }
    },
    [],
  );

  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className={dialogBackgroundStyles}>
        <DialogPanel className="w-full max-w-5xl">
          <div
            className={twMerge(
              paperWrapperStyles,
              "flex w-full max-w-5xl flex-col justify-between gap-4 px-6 pb-6 pt-4",
            )}
            style={{ height: "calc(100vh - 200px)" }}
          >
            <DialogTitle className="font-bold">Upload Video</DialogTitle>
            {dialogStatus === DialogAddMediaStatuses.STAGING_FILE && (
              <>
                <QuickTrimVideoUploader
                  file={currFile}
                  onFileStaged={(file) => {
                    setStates((curr) => ({ ...curr, file }));
                  }}
                  trimData={trimData}
                  onTrimChange={(newTrimData: TrimData) => {
                    trimData.value = newTrimData;
                  }}
                />
                <span className="grow" />
              </>
            )}
            <LoadingScreens
              currStatus={dialogStatus}
              retryButton={
                <ButtonSubmitAdd
                  file={file}
                  trimData={trimData}
                  onStatusChanged={changeDialogStatus}
                  onUploadedVideo={onUploadedVideo}
                  retry
                />
              }
            />

            <div className="flex w-full justify-center gap-4">
              <Button
                onClick={handleClose}
                variant="secondary"
                disabled={
                  dialogStatus === DialogAddMediaStatuses.FILE_UPLOADING ||
                  dialogStatus === DialogAddMediaStatuses.FILE_RECORD_REQUESTING
                }
              >
                Close
              </Button>
              {dialogStatus === DialogAddMediaStatuses.STAGING_FILE && (
                <ButtonSubmitAdd
                  file={currFile}
                  trimData={trimData}
                  onStatusChanged={changeDialogStatus}
                  onUploadedVideo={onUploadedVideo}
                />
              )}
              {(dialogStatus === DialogAddMediaStatuses.ERROR_FILE_UPLOAD ||
                dialogStatus ===
                  DialogAddMediaStatuses.ERROR_FILE_RECORD_REQUEST) && (
                <Button
                  onClick={() => {
                    setStates(initialState);
                  }}
                >
                  Add Another Video
                </Button>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
