import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { AppUIProvider } from "~/pages/PageEnigma/contexts/AppUiContext";
import { EngineProvider } from "~/pages/PageEnigma/contexts/EngineProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { toast, ToastBar, Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/pro-solid-svg-icons";

export const PageEnigma = () => {
  return (
    <TrackProvider>
      <AppUIProvider>
        <EngineProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                border: "1px solid #39394D",
                backgroundColor: "#39394D",
              },
              duration: 99999,
            }}
          >
            {(thisToast) => (
              <ToastBar toast={thisToast}>
                {({ message }) => {
                  return (
                    <div className="mr-3 flex justify-between rounded-lg">
                      <div>
                        {thisToast.type === "error" && (
                          <div className="ml-3 flex gap-4">
                            <FontAwesomeIcon
                              icon={faTriangleExclamation}
                              className="text-keyframe-selected"
                            />
                            <div className="text-base font-bold text-white">
                              Warning!
                            </div>
                          </div>
                        )}
                        <div className="text-left text-sm text-white opacity-50">
                          {message}
                        </div>
                      </div>
                      <button
                        onClick={() => toast.dismiss(thisToast.id)}
                        className="text-sm font-bold text-white opacity-50"
                      >
                        X
                      </button>
                    </div>
                  );
                }}
              </ToastBar>
            )}
          </Toaster>
          <PageEnigmaComponent />
        </EngineProvider>
      </AppUIProvider>
      <DragComponent />
    </TrackProvider>
  );
};
