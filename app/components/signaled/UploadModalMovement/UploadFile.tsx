import { FileUploader } from "react-drag-drop-files";
import { DragAndDropZone } from "./DragAndDropZone";

interface Props {
  title: string;
  fileTypes: string[];
  file: File | null;
  setFile: (file: File | null) => void;
}

export const UploadFile = ({ fileTypes, title, file, setFile }: Props) => {
  return (
    <div className="flex w-full flex-col gap-3">
      {title}
      <FileUploader
        handleChange={(file: File | null) => {
          setFile(file);
        }}
        name="file"
        types={fileTypes}
        maxSize={50}
      >
        <DragAndDropZone file={file} fileTypes={fileTypes} />
      </FileUploader>
    </div>
  );
};
