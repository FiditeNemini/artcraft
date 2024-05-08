import { AddToast, ToastTypes } from "~/contexts/ToasterContext";

export const downloadFile = ({
  url,
  addToast,
  title,
}:{
  url: string,
  addToast: AddToast,
  title: string
}) => {
  console.log(url);
  fetch(url)
    .then((resp) => resp.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = `${title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => addToast(ToastTypes.ERROR, "Could not download file."));
};

//check

