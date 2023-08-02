import React from "react";
import { Uploader } from "components/common";
import "./ImageUploader.scss";

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
      <img {...{ alt: "file preview", className: "file-preview", src: blob }} />
      <div {...{ className: "file-details panel rounded p-3" }}>Hi</div>
    </div>
  </Uploader>;
};