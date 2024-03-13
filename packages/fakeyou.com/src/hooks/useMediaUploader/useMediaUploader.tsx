import { useState } from "react";
import { useFile } from "hooks";
import { v4 as uuidv4 } from "uuid";
import { isSelectedType, MediaFilters } from "components/entities/EntityTypes";
import { UploadMedia, UploadMediaResponse } from "@storyteller/components/src/api/media_files/UploadMedia";
import {
  UploadEngineAsset,
  UploadEngineAssetResponse
}from "@storyteller/components/src/api/media_files/UploadEngineAsset";
import { MediaFileSubtype } from "@storyteller/components/src/api/enums/MediaFileSubtype";
import { GetFileTypeByExtension as extension } from "@storyteller/components/src/utils/GetFileTypeByExtension";

type UploaderResponse = UploadEngineAssetResponse | UploadMediaResponse;

interface Props {
  onSuccess?: (res: UploaderResponse) => any;
}

const n = () => {};

export default function useMediaUploader({ onSuccess = n }: Props) {
  const [engineSubtype,engineSubtypeSet] = useState<MediaFileSubtype | undefined>();

  const createUpload = (inputFile: File, todo = n ) => {
    const fileExtension = extension(inputFile.name || "");
    const isEngineAsset = isSelectedType(MediaFilters.engine_asset, fileExtension);
    const baseConfig = { uuid_idempotency_token: uuidv4(), file: inputFile };
    const engineConfig = { ...baseConfig, media_file_subtype: engineSubtype };
    const mediaConfig = { ...baseConfig, source: "file" };
    const uploader = isEngineAsset ? UploadEngineAsset(engineConfig) : UploadMedia(mediaConfig);

    if (inputFile) {
      uploader
      .then((res: UploaderResponse) => {
        if ("media_file_token" in res) {
          onSuccess(res);
          todo();
        }
      });
    }
  };

  const { file, clear, inputProps } = useFile({});

  const upload = () => createUpload(file,clear);

  const engineSubtypeChange = ({ target }: { target: any }) => engineSubtypeSet(target.value);

  return {
    clear,
    engineSubtype,
    engineSubtypeChange,
    file,
    inputProps,
    isAudio: isSelectedType(MediaFilters.audio, extension(file?.name || "")),
    isEngineAsset: isSelectedType(MediaFilters.engine_asset, extension(file?.name || "")),
    isImage: isSelectedType(MediaFilters.image, extension(file?.name || "")),
    isVideo: isSelectedType(MediaFilters.video, extension(file?.name || "")),
    upload
  }

};