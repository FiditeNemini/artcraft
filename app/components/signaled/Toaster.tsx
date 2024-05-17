import { useSignals } from "@preact/signals-react/runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faSquareCheck,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";

import { ToastTypes } from "~/enums";
import { toasts, deleteToast } from "~/signals";

export const Toaster = () => {
  useSignals();
  const TITLES = {
    [ToastTypes.ERROR]: "Error!",
    [ToastTypes.WARNING]: "Warning!",
    [ToastTypes.SUCCESS]: "Success",
  };
  const ICONS: Record<string, React.ReactNode> = {
    error: (
      <FontAwesomeIcon
        icon={faCircleExclamation}
        className="text-brand-primary-700"
      />
    ),
    warning: (
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="text-keyframe-selected"
      />
    ),
    success: (
      <FontAwesomeIcon icon={faSquareCheck} className="text-success-700" />
    ),
  };
  return (
    <>
      {toasts.value.map((toast, index) => (
        <div
          key={toast.id}
          className="rounded=lg fixed z-50 bg-black p-4"
          style={{ top: 74 + index * 80, right: 6 }}
        >
          <div className="mr-3 flex justify-between rounded-lg">
            <div>
              <div className="ml-3 flex items-center gap-4">
                {ICONS[toast.type]}
                <div className="text-base font-bold text-white">
                  {TITLES[toast.type]}
                </div>
              </div>
              <div className="text-left text-sm text-white opacity-50">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => deleteToast(toast.id)}
              className="text-sm font-bold text-white opacity-50"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};
