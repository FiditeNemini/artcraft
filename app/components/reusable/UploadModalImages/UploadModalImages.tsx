import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { TransitionDialogue, LoadingDots } from "~/components";

import { UploadAssetError } from "../UploadModal/UploadAssetError";
import { UploadSuccess } from "../UploadModal/UploadSuccess";
import { UploadFilesImages } from "./UploadFilesImages";
import { MediaFilesApi, MediaUploadApi } from "~/Classes/ApiManager";
import { FilterEngineCategories, MediaFileAnimationType } from "~/enums";

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
  };
}

enum UploaderState {
  ready,
  uploadingAsset,
  uploadingCover,
  settingCover,
  success,
  assetError,
  coverCreateError,
  coverSetError,
}

const initialState = {
  status: UploaderState.ready,
};

export function UploadModalImages({
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
    assetFile,
  }: {
    title: string;
    typeOption?: MediaFileAnimationType;
    assetFile: File;
    thumbnailFile: File | null;
  }) => {
    setUploaderState({ status: UploaderState.uploadingAsset });
    const mediaUploadApi = new MediaUploadApi();
    const assetReponse = await mediaUploadApi.UploadNewEngineAsset({
      file: assetFile,
      fileName: assetFile.name,
      engine_category: FilterEngineCategories.IMAGE_PLANE,
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

    setUploaderState({ status: UploaderState.uploadingCover });
    const thumbnailResponse = await mediaUploadApi.UploadImage({
      uuid: uuidv4(),
      blob: assetFile,
      fileName: getFileName(assetFile),
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

    const mediaFilesApi = new MediaFilesApi();
    const setThumbnailResponse = await mediaFilesApi.UpdateCoverImage({
      mediaFileToken: assetReponse.data,
      imageToken: thumbnailResponse.data,
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
          <UploadFilesImages
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
