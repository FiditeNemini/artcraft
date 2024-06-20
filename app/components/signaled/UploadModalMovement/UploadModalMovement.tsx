import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { TransitionDialogue, LoadingDots } from "~/components";

import { UploadAssetError } from "./UploadAssetError";
import { UploadSuccess } from "./UploadSuccess";
import { UploadFiles } from "./UploadFiles";
import { MediaFilesApi, MediaUploadApi } from "~/Classes/ApiManager";
import { FilterEngineCategories, MediaFileAnimationType } from "~/enums";
import { getFileName } from "~/utilities";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
  title: string;
  fileTypes: string[];
  typeOptions: { [key: string]: string }[];
  type: FilterEngineCategories;
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

export function UploadModalMovement({
  isOpen,
  onClose,
  onSuccess,
  title,
  fileTypes,
  typeOptions,
  type,
}: Props) {
  const [objUploadStatus, setObjUploadStatus] = useState(UploaderState.ready);

  const resetModalState = () => {
    setObjUploadStatus(UploaderState.ready);
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
    typeOption: MediaFileAnimationType;
    assetFile: File;
    length: number;
    thumbnailFile: File | null;
  }) => {
    setObjUploadStatus(UploaderState.uploadingAsset);
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
      setObjUploadStatus(UploaderState.assetError);
      return;
    }
    const assetToken = assetReponse.data;
    if (!thumbnailFile) {
      setObjUploadStatus(UploaderState.success);
      return;
    }

    setObjUploadStatus(UploaderState.uploadingCover);
    const thumbnailResponse = await mediaUploadApi.UploadImage({
      uuid: uuidv4(),
      blob: thumbnailFile,
      fileName: getFileName(thumbnailFile),
      maybe_title: "thumbnail_" + title,
    });
    if (!thumbnailResponse.success || !thumbnailResponse.data) {
      setObjUploadStatus(UploaderState.coverCreateError);
      return;
    }

    setObjUploadStatus(UploaderState.settingCover);
    const thumbnailToken = thumbnailResponse.data;
    const mediaFilesApi = new MediaFilesApi();
    const setThumbnailResponse = await mediaFilesApi.UpdateCoverImage({
      mediaFileToken: assetToken,
      imageToken: thumbnailToken,
    });
    if (!setThumbnailResponse.success) {
      setObjUploadStatus(UploaderState.coverSetError);
      return;
    }
    setObjUploadStatus(UploaderState.success);
  };

  const ObjUploaderContent = () => {
    switch (objUploadStatus) {
      case UploaderState.ready:
        return (
          <UploadFiles
            title={title}
            fileTypes={fileTypes}
            onClose={onClose}
            typeOptions={typeOptions}
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
      case UploaderState.coverCreateError:
      case UploaderState.coverSetError:
        return (
          <UploadAssetError
            onCancel={onClose}
            onRetry={() => {
              resetModalState();
            }}
            isAssetError={objUploadStatus === UploaderState.assetError}
          />
        );
    }
  };

  return (
    <TransitionDialogue isOpen={isOpen} onClose={onClose} title={title}>
      <ObjUploaderContent />
    </TransitionDialogue>
  );
}
