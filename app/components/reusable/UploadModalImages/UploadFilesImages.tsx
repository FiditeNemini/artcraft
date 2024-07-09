import { useState } from "react";

import { MediaFileAnimationType } from "~/enums";

import { Button, H6, Input, ListDropdown } from "~/components";
import { FileUploader } from "../UploadModal/FileUploader";

interface Props {
  title: string;
  fileTypes: string[];
  onClose: () => void;
  options?: {
    fileSubtypes?: { [key: string]: string }[];
    hasLength?: boolean;
    hasThumbnailUpload?: boolean;
  };
  onSubmit: (options: {
    title: string;
    typeOption?: MediaFileAnimationType;
    assetFile: File;
    length: number;
    thumbnailFile: File | null;
  }) => void;
}

export const UploadFilesImages = ({
  fileTypes,
  onClose,
  title,
  options,
  onSubmit,
}: Props) => {
  const fileSubtypes = options?.fileSubtypes;

  const [typeOption, setTypeOption] = useState<
    MediaFileAnimationType | undefined
  >(
    fileSubtypes
      ? (Object.values(fileSubtypes[0])[0] as MediaFileAnimationType)
      : undefined,
  );
  const [uploadTitle, setUploadTitle] = useState<{
    value: string;
    error?: string;
  }>({
    value: "",
  });

  const [assetFile, setAssetFile] = useState<{
    value: File | null;
    error?: string;
  }>({ value: null });

  const handleSubmit = () => {
    if (!uploadTitle.value) {
      setUploadTitle((curr) => ({
        ...curr,
        error: "Please enter a title.",
      }));
      return;
    }

    if (!assetFile.value) {
      setAssetFile((curr) => ({
        ...curr,
        error: "Please select a file to upload.",
      }));
      return;
    }

    onSubmit({
      title: uploadTitle.value,
      assetFile: assetFile.value,
      typeOption,
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-4">
        <Input
          placeholder="Enter the title here"
          errorMessage={uploadTitle.error}
          value={uploadTitle.value}
          onChange={(event) => setUploadTitle({ value: event.target.value })}
          className={uploadTitle.error ? "mb-3" : ""}
        />
        {fileSubtypes && fileSubtypes.length > 1 && (
          <ListDropdown
            list={fileSubtypes}
            onSelect={(value) => setTypeOption(value as MediaFileAnimationType)}
          />
        )}
        <FileUploader
          title={title}
          fileTypes={fileTypes}
          file={assetFile.value}
          setFile={(file: File | null) => {
            setAssetFile({
              value: file,
            });
          }}
        />
        {assetFile.error && (
          <H6 className="z-10 text-red">{assetFile.error}</H6>
        )}

        <div className="relative m-auto aspect-square w-full overflow-hidden rounded-lg bg-brand-secondary">
          {!assetFile.value && (
            <H6 className="absolute left-0 top-1/2 -mt-5 w-full text-center">
              File Preivew
            </H6>
          )}
          {assetFile.value && (
            <img
              alt="file upload preview"
              className="m-auto max-h-full max-w-full"
              src={URL.createObjectURL(assetFile.value)}
            />
          )}
        </div>

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
