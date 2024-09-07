import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import {
  faFileArrowUp,
  faFileImage,
  faFileVideo,
} from "@fortawesome/pro-solid-svg-icons";
import { getFileName } from "~/utilities";

import { VIDEO_FILE_TYPE } from "./enums";

interface Props {
  file: File | null;
  fileTypes: string[];
}

export const DragAndDropZone = ({ file, fileTypes }: Props) => {
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
        ? `${Math.floor(file.size / 1024)} KB`
        : null;

  const fileName = file && getFileName(file).toUpperCase();
  const wrapperClassName = twMerge(
    "group cursor-pointer p-3 bg-ui-panel",
    "flex items-center gap-3.5",
    "rounded-lg border-2 border-dashed border-ui-border",
  );

  if (!file) {
    return (
      <div className={wrapperClassName}>
        <FontAwesomeIcon icon={faFileArrowUp} className="text-4xl" />
        <div className="flex flex-col gap-0">
          <p className="font-medium">
            <u>Upload a file</u> or drop it here
          </p>
          <p className="flex items-center gap-2 text-sm font-normal opacity-50">
            {fileTypes.join(", ").toString().toUpperCase()} supported
          </p>
        </div>
      </div>
    );
  } else {
    const icon = fileTypes.includes(Object.values(VIDEO_FILE_TYPE)[0])
      ? faFileVideo
      : faFileImage;
    return (
      <div className={wrapperClassName}>
        <FontAwesomeIcon icon={icon} className="text-4xl" />
        <div className="flex grow flex-col gap-0">
          <p className="font-medium">
            {file.name.slice(0, file.name.lastIndexOf("."))}
          </p>
          <p className="flex items-center gap-2 text-sm font-normal">
            <span className="opacity-50">
              {`${fileName} file size: ${fileSize} `}
            </span>
            <u className="transition-all group-hover:text-primary">
              Change File
            </u>
          </p>
        </div>
      </div>
    );
  }
};
