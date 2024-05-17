import { Button, H6, Input, ListDropdown } from "~/components";
import { UploadFile } from "./UploadFile";
import { useState } from "react";
import { MediaFileAnimationType } from "~/api/media_files/UploadNewEngineAsset";

interface Props {
  title: string;
  fileTypes: string[];
  onClose: () => void;
  typeOptions: { [key: string]: string }[];
  onSubmit: (options: {
    title: string;
    typeOption: MediaFileAnimationType;
    assetFile: File;
    length: number;
    thumbnailFile: File | null;
  }) => void;
}

export const UploadFiles = ({
  fileTypes,
  onClose,
  title,
  typeOptions,
  onSubmit,
}: Props) => {
  const [typeOption, setTypeOption] = useState<MediaFileAnimationType>(
    Object.values(typeOptions[0])[0] as MediaFileAnimationType,
  );
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadLength, setUploadLength] = useState<number>();
  const [titleError, setTitleError] = useState("");
  const [assetFileError, setAssetFileError] = useState("");
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!uploadTitle) {
      setTitleError("Please enter the title");
    } else {
      setTitleError("");
    }

    if (!assetFile) {
      setAssetFileError("Please select a file to upload");
    } else {
      setAssetFileError("");
    }

    if (!uploadTitle || !assetFile) {
      return;
    }
    onSubmit({
      title: uploadTitle,
      assetFile: assetFile,
      thumbnailFile: thumbnailFile,
      length: uploadLength ?? 1000,
      typeOption,
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-4">
        <Input
          placeholder="Enter the title here"
          errorMessage={titleError}
          value={uploadTitle}
          onChange={(event) => setUploadTitle(event.target.value)}
          className={titleError ? "mb-3" : ""}
        />
        {typeOptions.length > 1 && (
          <ListDropdown
            list={typeOptions}
            onSelect={(value) => setTypeOption(value as MediaFileAnimationType)}
          />
        )}
        <Input
          type="number"
          placeholder="Enter the length in ms (optional)"
          value={uploadLength}
          onChange={(event) => setUploadLength(parseInt(event.target.value))}
        />
        <UploadFile
          title={title}
          fileTypes={fileTypes}
          file={assetFile}
          setFile={setAssetFile}
        />
        {assetFileError && <H6 className="z-10 text-red">{assetFileError}</H6>}
        <UploadFile
          title="Upload Thumbnail (optional)"
          fileTypes={["PNG", "JGP", "GIF"]}
          file={thumbnailFile}
          setFile={setThumbnailFile}
        />
        <div className="flex justify-end gap-4">
          <Button variant="primary" onClick={handleSubmit}>
            Upload
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};
