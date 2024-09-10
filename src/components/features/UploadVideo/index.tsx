import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Cropper, { Point, Area } from "react-easy-crop";

import { FileUploader, VIDEO_FILE_TYPE } from "../FileUploader";
import { Button } from "~/components/ui";

import { paperWrapperStyles } from "~/components/styles";
import { dispatchUiEvents } from "~/signals/uiEvents";

function readFile(file: File) {
  return new Promise<string | ArrayBuffer | null>((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}
export const UploadVideo = ({
  isOpen,
  closeCallback,
}: {
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Point) => {
    console.log(croppedArea, croppedAreaPixels);
  };

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
            "w-full max-w-xl space-y-4 p-8",
          )}
        >
          <DialogTitle className="font-bold">Upload Video</DialogTitle>
          <FileUploader
            title=""
            fileTypes={Object.values(VIDEO_FILE_TYPE)}
            file={assetFile}
            setFile={async (file: File | null) => {
              setAssetFile(file);
              if (file) {
                let videoDataUrl = await readFile(file);
                setVideoFile(videoDataUrl as string);
              }
            }}
          />
          {assetFile && videoFile && (
            <div className="relative flex aspect-video items-center justify-center rounded-xl bg-ui-border">
              <label className="absolute left-0 top-0 rounded-br-xl rounded-tl-xl border border-ui-border bg-white p-2 shadow-md">
                Preview
              </label>
              {/* <video
                src={URL.createObjectURL(assetFile)}
                controls
                className="border border-dashed border-white"
              /> */}
              <div className="crop-container">
                <Cropper
                  video={videoFile}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  // onImageLoaded={(res:any) => {
                  //   console.log(res);
                  // }}
                />
              </div>
            </div>
          )}
          <div className="flex w-full justify-end gap-4 pt-4">
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
