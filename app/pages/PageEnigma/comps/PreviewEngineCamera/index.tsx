import { useContext, useEffect, useState } from "react";
import { EngineContext } from "../../../../contexts/EngineContext";
import { Button, Input, LoadingDotsTyping } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCameraViewfinder } from "@fortawesome/pro-solid-svg-icons";

export const PreviewEngineCamera = () => {
  const editorEngine = useContext(EngineContext);
  //take data from egine context

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [currentMessage, setCurrentMessage] =
    useState<string>("Enter Camera View");
  useEffect(() => {
    setTimeout(() => setShowLoader(false), 1000);
  }, []);

  const handleButtonCameraView = () => {
    editorEngine?.switchCameraView();
    if (currentMessage === "Enter Camera View") {
      setCurrentMessage("Exit Camera View");
    } else {
      setCurrentMessage("Enter Camera View");
    }
  };

  return (
    <div id="preview-engine-camera" className="w-30 absolute bottom-0 m-4">
      <div className="relative">
        <div className="-z-10 flex w-full items-center justify-between rounded-t-lg bg-ui-controls p-2 text-white">
          <div className="ms-1 flex items-center gap-2">
            <FontAwesomeIcon icon={faCameraViewfinder} />
            <p className="mt-[2px] text-sm font-medium">Camera View</p>
          </div>

          <Button
            variant="action"
            onClick={handleButtonCameraView}
            className="px-2.5 py-1 text-sm"
          >
            {currentMessage}
          </Button>
        </div>
        <div className="box relative overflow-hidden rounded-b-lg border border-gray-600">
          <canvas className="aspect-video max-h-40" id="camera-view"></canvas>
          <div className="absolute left-0 top-0 h-full w-full">
            <LoadingDotsTyping isShowing={showLoader} />
          </div>
        </div>
      </div>
    </div>
  );
};
