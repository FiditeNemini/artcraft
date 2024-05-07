import { useCallback, useState } from "react";
import { TransitionDialogue, LoadingDots } from "~/components";
import "./UploadModal.scss";
import { UploadLoaderError } from "~/components/UploadModalMovement/UploadLoaderError";
import { UploadAssetError } from "~/components/UploadModalMovement/UploadAssetError";
import { UploadSuccess } from "~/components/UploadModalMovement/UploadSuccess";
import { UploadFiles } from "~/components/UploadModalMovement/UploadFiles";
import {
  MediaFileAnimationType,
  MediaFileEngineCategory,
  UploadNewEngineAsset,
} from "~/api/media_files/UploadNewEngineAsset";
import { v4 as uuidv4 } from "uuid";
import { UploadMedia } from "~/api/media_files/UploadMedia";
import { EditCoverImage } from "~/api/media_files/EditCoverImage";

interface Props {
  closeModal: () => void;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
  title: string;
  fileTypes: string[];
  typeOptions: { [key: string]: string }[];
  type: MediaFileEngineCategory;
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
  loaderError,
}

export default function UploadModalMovement({
  closeModal,
  isOpen,
  onClose,
  onSuccess,
  title,
  fileTypes,
  typeOptions,
  type,
}: Props) {
  const [objUploadStatus, setObjUploadStatus] = useState(UploaderState.ready);

  const resetModalState = useCallback(() => {
    setObjUploadStatus(UploaderState.ready);
  }, []);

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
    const res = await UploadNewEngineAsset({
      engine_category: type,
      file: assetFile,
      maybe_animation_type: typeOption as MediaFileAnimationType,
      maybe_duration_millis: length,
      maybe_title: title,
      uuid_idempotency_token: uuidv4(),
    });
    if (!("media_file_token" in res)) {
      setObjUploadStatus(UploaderState.assetError);
      return;
    }
    const assetToken = res.media_file_token;
    if (!thumbnailFile) {
      setObjUploadStatus(UploaderState.success);
      return;
    }
    const resp = await UploadMedia({
      uuid_idempotency_token: uuidv4(),
      file: thumbnailFile,
      source: title,
    });
    if (!("media_file_token" in resp)) {
      setObjUploadStatus(UploaderState.uploadingCover);
      return;
    }
    const thumbnailToken = resp.media_file_token;
    const editRes = await EditCoverImage(assetToken, {
      cover_image_media_file_token: thumbnailToken,
    });
    if (!editRes.success) {
      setObjUploadStatus(UploaderState.uploadingCover);
      return;
    }
    setObjUploadStatus(UploaderState.success);
  };

  const objUploaderContent = () => {
    switch (objUploadStatus) {
      case UploaderState.ready:
        return (
          <UploadFiles
            title={title}
            fileTypes={fileTypes}
            onClose={() => {
              closeModal();
              onClose();
            }}
            typeOptions={typeOptions}
            onSubmit={onSubmit}
          />
        );
      case UploaderState.uploadingAsset:
      case UploaderState.uploadingCover:
      case UploaderState.settingCover:
        return (
          <div {...{ className: "obj-uploader-modal-load-view" }}>
            <LoadingDots {...{ className: "uploader-dots" }} />
            <div {...{ className: "uploader-message" }}>Uploading...</div>
          </div>
        );
      case UploaderState.success:
        return (
          <UploadSuccess
            title={title}
            onOk={() => {
              closeModal();
              onClose();
              onSuccess();
              setTimeout(() => setObjUploadStatus(UploaderState.ready), 0);
            }}
          />
        );
      case UploaderState.assetError:
      case UploaderState.coverCreateError:
      case UploaderState.coverSetError:
        return (
          <UploadAssetError
            onCancel={() => {
              closeModal();
              onClose();
              setTimeout(() => setObjUploadStatus(UploaderState.ready), 0);
            }}
            onRetry={() => {
              switch (objUploadStatus) {
                case UploaderState.assetError: {
                  break;
                }
                case UploaderState.coverCreateError: {
                  break;
                }
              }
            }}
            isAssetError={objUploadStatus === UploaderState.assetError}
          />
        );
      case UploaderState.loaderError:
        return (
          <UploadLoaderError
            onCancel={() => {
              closeModal();
              onClose();
              setTimeout(() => setObjUploadStatus(UploaderState.ready), 0);
            }}
            onRetry={() => {
              setObjUploadStatus(UploaderState.ready);
              resetModalState();
            }}
          />
        );
    }
  };

  return (
    <TransitionDialogue
      {...{
        isOpen,
        onClose,
        title: title,
      }}>
      {objUploaderContent()}
    </TransitionDialogue>
  );
}
