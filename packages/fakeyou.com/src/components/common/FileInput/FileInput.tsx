import React from "react";
import { FileDetails, FileLabel, FileWrapper } from "components/common";
import { faFileAudio } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  label?: string;
  blob?: string;
  children?: any;
  clear?: (file?: any) => void;
  file?: any;
  hideDetails?: boolean;
  hideClearDetails?: boolean;
  inputProps?: any;
  [x: string]: any;
  fileTypes?: string[];
}

const n = () => {};

export default function FileInput({
  label,
  children,
  clear = n,
  file,
  hideDetails,
  hideClearDetails,
  inputProps,
  fileTypes = ["MP3"],
  ...rest
}: Props) {
  return (
    <div>
      {label && <label className="sub-title">{label}</label>}
      <FileWrapper
        {...{ fileTypes, ...inputProps, panelClass: "p-3", ...rest }}
      >
        {file ? (
          <FileDetails
            {...{ clear, hideClearDetails, icon: faFileAudio, file }}
          />
        ) : (
          <FileLabel {...{ fileTypes }} />
        )}
      </FileWrapper>
      {children}
    </div>
  );
}
