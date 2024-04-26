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
  type: ToastTypes;
  icon: ReactNode;
  title: string;
  message: string;
}

export enum ToastTypes {
  SUCCESS,
  WARNING,
  ERROR,
}

export type AddToast = (type: ToastTypes, message: string) => void;

export interface ToastProps {
  toasts: Toast[];
  addToast: AddToast;
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
  [ToastTypes.ERROR]: "Error!",
  [ToastTypes.WARNING]: "Warning!",
  [ToastTypes.SUCCESS]: "Success",
};

export const ToasterContext = createContext<ToastProps>({
  toasts: [],
  addToast: () => {},
});

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastTypes, message: string) => {
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
      type === ToastTypes.SUCCESS ? 20000 : 3000,
    );
  }, []);

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
          style={{ top: 74 + index * 80, right: 6 }}>
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
              className="text-sm font-bold text-white opacity-50">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      ))}
      {children}
    </ToasterContext.Provider>
  );
};
