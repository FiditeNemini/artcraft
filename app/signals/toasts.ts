import { v4 as uuidv4 } from "uuid";
import { signal } from "@preact/signals-core";
import { ToastTypes } from "~/enums";

export interface Toast {
  id: string;
  type: ToastTypes;
  message: string;
}

export const toasts = signal<Toast[]>([]);

export const addToast = (type: ToastTypes, message: string) => {
  const newToast: Toast = {
    id: uuidv4(),
    type,
    message,
  };
  toasts.value = [...toasts.value, newToast];
  setTimeout(
    () => {
      //delete toast after timeout
      deleteToast(newToast.id);
    },
    type === ToastTypes.SUCCESS ? 20000 : 3000,
  );
};
export const deleteToast = (id: string) => {
  const filteredToasts = toasts.value.filter((toast) => toast.id !== id);
  if (filteredToasts.length < toasts.value.length) {
    toasts.value = [...filteredToasts];
  }
};
