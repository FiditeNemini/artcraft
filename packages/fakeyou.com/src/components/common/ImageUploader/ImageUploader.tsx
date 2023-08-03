import React from "react";
import { UploadDetails, Uploader, UploadLabel } from "components/common";
import "./ImageUploader.scss";

const fileTypes = ["JPG", "GIF", "PNG"];

interface Props {
  blob?: string;
  file?: any;
  handleUploadFile?: () => void;
  onChange?: (file?: any) => void;
  onClear?: (file?: any) => void;
  uploading?: boolean;
  uploadDisabled?: boolean;
}

const n = () => {};

export default function ImageUploader({ blob = "", file, handleUploadFile = n, onChange = n, onClear = n, uploading = false, uploadDisabled = false }: Props) {
  return <Uploader {...{ onChange }}>
    <div {...{ className: "fy-image-uploader" }}>
      { file ? <>
        <img {...{ alt: "file preview", className: "file-preview", src: blob }} />
        <UploadDetails {...{ file }}/>
      </> : <>
        <svg {...{ className: "image-placeholder", height: 400, viewBox: "0 0 300 300", width: 400 }}>
          <path d="m152.42 226c41.8 0 69.49-43.57 73.21-90.87 3.78-47.97-26.06-87.13-75.69-87.13-49.64 0-79.28 39.15-75.69 87.13 3.72 49.79 36.37 90.87 78.17 90.87zm-29.19-50.93c1.62-1.51 4.15-1.42 5.65.2 4.1 4.41 15.31 6.97 21.88 6.97s17.77-2.56 21.88-6.97c1.5-1.62 4.04-1.71 5.65-.2 1.62 1.5 1.92 3.95.2 5.65-6.31 6.27-18.31 9.52-27.74 9.52s-22.16-3.54-27.74-9.52c-1.49-1.61-1.4-4.14.22-5.65zm115.25 112.93h-176.62c-37.67 0-38.24-17.41-27.56-26.36 21.49-18.01 57.18-23.64 114.81-23.64 60.01 0 96.24 4.84 117.41 24.06 10.09 9.16 7.67 25.94-28.04 25.94z"/>
        </svg>
        <div {...{ className: "image-upload-label" }}>
          <UploadLabel {...{ file, fileTypes }} />
        </div>
      </> }
    </div>
  </Uploader>;
};