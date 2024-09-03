import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faFileAudio } from "@fortawesome/pro-thin-svg-icons";
import { getFileName } from "~/utilities";

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

  if (!file) {
    return (
      <div className="flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-dashed border-ui-border bg-ui-panel p-3">
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
    return (
      <div className="flex cursor-pointer items-center justify-between gap-3.5 rounded-lg border-2 border-dashed border-ui-border bg-ui-panel p-3">
        <FontAwesomeIcon icon={faFileAudio} className="text-4xl" />
        <div className="flex grow flex-col gap-0">
          <p className="font-medium">
            {file.name.slice(0, file.name.lastIndexOf("."))}
          </p>
          <p className="flex items-center gap-2 text-sm font-normal">
            <span className="opacity-50">
              {`${fileName} file size: ${fileSize} `}
            </span>
            <u className="transition-all hover:text-white/80">Change File</u>
          </p>
        </div>
      </div>
    );
  }
};
