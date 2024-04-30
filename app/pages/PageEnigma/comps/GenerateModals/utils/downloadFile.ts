import { AddToast, ToastTypes } from "~/contexts/ToasterContext";

export const downloadFile = (url: string, addToast: AddToast) => {
  fetch(url)
    .then((resp) => resp.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = url;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => addToast(ToastTypes.ERROR, "Could not download file."));
};
