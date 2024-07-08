import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { TransitionDialogue, LoadingDots } from "~/components";

import { UploadAssetError } from "./UploadAssetError";
import { UploadSuccess } from "./UploadSuccess";
import { UploadFiles } from "./UploadFiles";
import { MediaFilesApi, MediaUploadApi } from "~/Classes/ApiManager";
import {
  FilterEngineCategories,
  MediaFileAnimationType,
  UploaderState,
} from "~/enums";
import { getFileName } from "~/utilities";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
  title: string;
  fileTypes: string[];
  type: FilterEngineCategories;
  options?: {
    fileSubtypes?: { [key: string]: string }[];
    hasLength?: boolean;
    hasThumbnailUpload?: boolean;
  };
}

const initialState = {
  status: UploaderState.ready,
};

export function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  fileTypes,
  type,
  options,
}: Props) {
  const [uploaderState, setUploaderState] = useState<{
    status: UploaderState;
    errorMessage?: string;
  }>(initialState);

  const resetModalState = () => {
    setUploaderState(initialState);
  };

  useEffect(() => {
    if (isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const onSubmit = async ({
    title,
    typeOption,
    assetFile,
    length,
    thumbnailFile,
  }: {
    title: string;
    typeOption?: MediaFileAnimationType;
    assetFile: File;
    length: number;
    thumbnailFile: File | null;
  }) => {
    setUploaderState({ status: UploaderState.uploadingAsset });
    const mediaUploadApi = new MediaUploadApi();
    const assetReponse = await mediaUploadApi.UploadNewEngineAsset({
      file: assetFile,
      fileName: assetFile.name,
      engine_category: type,
      maybe_animation_type: typeOption,
      maybe_duration_millis: length,
      maybe_title: title,
      uuid: uuidv4(),
    });

    if (!assetReponse.success || !assetReponse.data) {
      setUploaderState({
        status: UploaderState.assetError,
        errorMessage: assetReponse.errorMessage,
      });
      return;
    }
    const assetToken = assetReponse.data;
    if (!thumbnailFile) {
      setUploaderState({ status: UploaderState.success });
      return;
    }

    setUploaderState({ status: UploaderState.uploadingCover });
    const thumbnailResponse = await mediaUploadApi.UploadImage({
      uuid: uuidv4(),
      blob: thumbnailFile,
      fileName: getFileName(thumbnailFile),
      maybe_title: "thumbnail_" + title,
    });
    if (!thumbnailResponse.success || !thumbnailResponse.data) {
      setUploaderState({
        status: UploaderState.coverCreateError,
        errorMessage: thumbnailResponse.errorMessage,
      });
      return;
    }

    setUploaderState({ status: UploaderState.settingCover });
    const thumbnailToken = thumbnailResponse.data;
    const mediaFilesApi = new MediaFilesApi();
    const setThumbnailResponse = await mediaFilesApi.UpdateCoverImage({
      mediaFileToken: assetToken,
      imageToken: thumbnailToken,
    });
    if (!setThumbnailResponse.success) {
      setUploaderState({
        status: UploaderState.coverSetError,
        errorMessage: setThumbnailResponse.errorMessage,
      });
      return;
    }
    setUploaderState({ status: UploaderState.success });
  };

  const UploaderModalContent = () => {
    switch (uploaderState.status) {
      case UploaderState.ready:
        return (
          <UploadFiles
            title={title}
            fileTypes={fileTypes}
            options={options}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        );
      case UploaderState.uploadingAsset:
      case UploaderState.uploadingCover:
      case UploaderState.settingCover:
        return (
          <>
            <LoadingDots className="mb-1 bg-transparent" />
            <div className="w-100 text-center opacity-50">Uploading...</div>
          </>
        );
      case UploaderState.success:
        return (
          <UploadSuccess
            title={title}
            onOk={() => {
              onSuccess();
              onClose();
            }}
          />
        );
      case UploaderState.assetError:
        return (
          <UploadAssetError
            onCancel={onClose}
            onRetry={() => {
              resetModalState();
            }}
            type={type}
            errorMessage={uploaderState.errorMessage}
          />
        );
      case UploaderState.coverCreateError:
      case UploaderState.coverSetError:
        return (
          <UploadAssetError
            onCancel={onClose}
            onRetry={() => {
              resetModalState();
            }}
            type={"Thumbnail"}
            errorMessage={uploaderState.errorMessage}
          />
        );
    }
  };

  return (
    <TransitionDialogue isOpen={isOpen} onClose={onClose} title={title}>
      <UploaderModalContent />
    </TransitionDialogue>
  );
}
