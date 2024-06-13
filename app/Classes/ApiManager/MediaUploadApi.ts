import { ApiManager, ApiResponse } from "./ApiManager";
import { Visibility } from "~/enums";

export class MediaUploadApi extends ApiManager {
  public async UploadThumbnail({
    mediaFileToken,
    imageToken,
  }: {
    mediaFileToken: string;
    imageToken: string;
  }): Promise<ApiResponse<undefined>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/cover_image/${mediaFileToken}`;
    return await this.post<
      { cover_image_media_file_token: string },
      {
        success?: boolean;
        BadInput?: string;
      }
    >({ endpoint, body: { cover_image_media_file_token: imageToken } })
      .then((response) => ({
        success: response.success ?? false,
        errorMessage: response.BadInput,
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }

  public async UploadImage({
    uuid,
    blob,
    fileName,
    title,
    visibility = Visibility.Public,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    title?: string;
    visibility?: Visibility;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/image`;
    const formRecord = {
      is_intermediate_system_file: "true",
      ...(title ? { maybe_title: title } : {}),
      maybe_visibility: visibility,
    };
    return await this.postForm<{
      success: boolean;
      media_file_token?: string;
      BadInput?: string;
    }>({ endpoint, formRecord, blob, blobFileName: fileName, uuid })
      .then((response) => ({
        success: Boolean(response.success ?? false),
        data: response.media_file_token,
        errorMessage: response.BadInput,
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }

  public async UploadVideo({
    uuid,
    blob,
    fileName,
    title,
    styleName,
    sceneSourceMediaFileToken,
    visibility = Visibility.Public,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    title: string;
    styleName?: string;
    sceneSourceMediaFileToken?: string;
    visibility?: Visibility;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/new_video`;
    const formRecord = {
      is_intermediate_system_file: "true",
      maybe_title: title,
      maybe_visibility: visibility,
      ...(styleName ? { maybe_style_name: styleName } : {}),
      ...(sceneSourceMediaFileToken
        ? {
            maybe_scene_source_media_file_token: sceneSourceMediaFileToken,
          }
        : {}),
    };
    return await this.postForm<{
      success?: string;
      media_file_token?: string;
      BadInput?: string;
    }>({
      endpoint,
      formRecord,
      blob,
      blobFileName: fileName,
      uuid,
    })
      .then((response) => ({
        success: Boolean(response.success ?? false),
        data: response.media_file_token,
        errorMessage: response.BadInput,
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }
}
