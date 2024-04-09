import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faSquareCheck,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import * as uuid from "uuid";

export interface Toast {
  id: string;
  type: "success" | "warning" | "error";
  icon: ReactNode;
  title: string;
  message: string;
}

export interface ToastProps {
  toasts: Toast[];
  addToast: (type: "success" | "warning" | "error", message: string) => void;
}

const ICONS: Record<string, ReactNode> = {
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

const TITLES = {
  error: "Error!",
  warning: "Warning!",
  success: "Success",
};

export const ToasterContext = createContext<ToastProps>({
  toasts: [],
  addToast: () => {},
});

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: "success" | "warning" | "error", message: string) => {
      const toast = {
        id: uuid.v4(),
        type,
        icon: ICONS[type],
        title: TITLES[type],
        message,
      } as Toast;
      setToasts((oldToasts) => {
        return [toast, ...oldToasts];
      });

      setTimeout(
        () => {
          setToasts((oldToasts) =>
            oldToasts.filter((row) => row.id !== toast.id),
          );
        },
        type === "success" ? 20000 : 3000,
      );
    },
    [],
  );

  const value = useMemo(() => {
    return {
      toasts,
      addToast,
    };
  }, [toasts, addToast]);

  return (
    <ToasterContext.Provider value={value}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="rounded=lg fixed z-50 bg-black p-4"
          style={{ top: 74 + index * 80, right: 6 }}
        >
          <div className="mr-3 flex justify-between rounded-lg">
            <div>
              <div className="ml-3 flex items-center gap-4">
                {toast.icon}
                <div className="text-base font-bold text-white">
                  {toast.title}
                </div>
              </div>
              <div className="text-left text-sm text-white opacity-50">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() =>
                setToasts((oldToasts) =>
                  oldToasts.filter((row) => row.id !== toast.id),
                )
              }
              className="text-sm font-bold text-white opacity-50"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      ))}
      {children}
    </ToasterContext.Provider>
  );
};
