import { v4 as uuidv4 } from "uuid";
import { signal } from "@preact/signals-core";
import { ToastTypes } from "~/enums";
import { FIVE_SECONDS, ONE_MINUTE, SEVEN_SECONDS } from "~/constants";

export interface Toast {
  id: string;
  type: ToastTypes;
  message: string;
}

export const toasts = signal<Toast[]>([]);

export const addToast = (
  type: ToastTypes,
  message: string,
  timeout?: number | false,
) => {
  const newToast: Toast = {
    id: uuidv4(),
    type,
    message,
  };
  toasts.value = [...toasts.value, newToast];
  if (timeout === undefined || typeof timeout === "number") {
    const calTimeout = timeout
      ? timeout
      : type === ToastTypes.SUCCESS
        ? ONE_MINUTE
        : FIVE_SECONDS;
    setTimeout(() => {
      //delete toast after timeout
      deleteToast(newToast.id);
    }, calTimeout);
  }
};
export const deleteToast = (id: string) => {
  const filteredToasts = toasts.value.filter((toast) => toast.id !== id);
  if (filteredToasts.length < toasts.value.length) {
    toasts.value = [...filteredToasts];
  }
};
