import React from 'react';

interface Props {
  file?: any;
}

export default function UploadDetails({ file }: Props) {
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  return <div {...{ className: "upload-details d-flex gap-1" }}>
    <div>
      { file && <p>
          <span className="opacity-50">
            {file && `${file.name.split(".").pop().toUpperCase()} `}
            file size: { fileSize }
          </span>{" "}
          <u className="fw-medium opacity-100 ms-1">Change file</u>
      </p> }
    </div>
  </div>;
};
