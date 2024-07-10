import { v4 as uuidv4 } from "uuid";
import { UploaderStates, FilterEngineCategories } from "~/enums";
import { MediaUploadApi, MediaFilesApi } from "~/Classes/ApiManager";
import { getFileName } from "~/utilities";
import { UploaderState } from "~/models";

export const uploadImagePlane = async ({
  title,
  assetFile,
  progressCallback,
}: {
  title: string;
  assetFile: File;
  progressCallback: (newState: UploaderState) => void;
}) => {
  progressCallback({ status: UploaderStates.uploadingAsset });
  const mediaUploadApi = new MediaUploadApi();
  const assetReponse = await mediaUploadApi.UploadNewEngineAsset({
    file: assetFile,
    fileName: assetFile.name,
    engine_category: FilterEngineCategories.IMAGE_PLANE,
    maybe_title: title,
    uuid: uuidv4(),
  });

  if (!assetReponse.success || !assetReponse.data) {
    progressCallback({
      status: UploaderStates.assetError,
      errorMessage: assetReponse.errorMessage,
    });
    return;
  }

  progressCallback({ status: UploaderStates.uploadingCover });
  const thumbnailResponse = await mediaUploadApi.UploadImage({
    uuid: uuidv4(),
    blob: assetFile,
    fileName: getFileName(assetFile),
    maybe_title: "thumbnail_" + title,
  });
  if (!thumbnailResponse.success || !thumbnailResponse.data) {
    progressCallback({
      status: UploaderStates.coverCreateError,
      errorMessage: thumbnailResponse.errorMessage,
    });
    return;
  }

  progressCallback({ status: UploaderStates.settingCover });

  const mediaFilesApi = new MediaFilesApi();
  const setThumbnailResponse = await mediaFilesApi.UpdateCoverImage({
    mediaFileToken: assetReponse.data,
    imageToken: thumbnailResponse.data,
  });
  if (!setThumbnailResponse.success) {
    progressCallback({
      status: UploaderStates.coverSetError,
      errorMessage: setThumbnailResponse.errorMessage,
    });
    return;
  }
  progressCallback({ status: UploaderStates.success });
};
