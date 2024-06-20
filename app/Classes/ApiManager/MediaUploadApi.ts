import { ApiManager, ApiResponse } from "./ApiManager";
import { FilterEngineCategories, Visibility } from "~/enums";

export class MediaUploadApi extends ApiManager {
  private async Upload({
    endpoint,
    uuid,
    blob,
    fileName,
    options,
  }: {
    endpoint: string;
    blob: Blob | File;
    fileName: string;
    uuid: string;
    options: Record<string, string | number | undefined>;
  }): Promise<ApiResponse<string>> {
    const formRecord = Object.entries(options).reduce(
      (allOptions, [key, value]) => {
        if (value === undefined) {
          return allOptions;
        }
        return { ...allOptions, [key]: value.toString() };
      },
      {} as Record<string, string>,
    );

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

  public async UploadAudio({
    blob,
    fileName,
    uuid,
    maybe_title,
    maybe_visibility = Visibility.Public,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    maybe_title?: string | undefined;
    maybe_visibility?: Visibility | undefined;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/audio`;
    const options: Record<string, string | number | undefined> = {
      maybe_title,
      maybe_visibility: maybe_visibility?.toString(),
    };
    return this.Upload({ endpoint, blob, fileName, uuid, options });
  }

  public async UploadImage({
    blob,
    fileName,
    uuid,
    maybe_title,
    maybe_visibility = Visibility.Public,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    maybe_title?: string | undefined;
    maybe_visibility?: Visibility | undefined;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/image`;
    const options: Record<string, string | number | undefined> = {
      is_intermediate_system_file: "true",
      maybe_title,
      maybe_visibility: maybe_visibility?.toString(),
    };
    return this.Upload({ endpoint, blob, fileName, uuid, options });
  }

  public async UploadNewEngineAsset({
    file,
    fileName,
    uuid,
    engine_category,
    maybe_animation_type,
    maybe_duration_millis,
    maybe_title,
    maybe_visibility = Visibility.Public,
  }: {
    file: File;
    fileName: string;
    uuid: string;
    engine_category: FilterEngineCategories;
    maybe_animation_type?: string;
    maybe_duration_millis?: number;
    maybe_title?: string;
    maybe_visibility?: Visibility;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/new_engine_asset`;
    const options: Record<string, string | number | undefined> = {
      engine_category,
      maybe_title,
      maybe_visibility: maybe_visibility?.toString(),
      maybe_animation_type,
      maybe_duration_millis,
    };
    return this.Upload({ endpoint, blob: file, fileName, uuid, options });
  }

  public async UploadNewScene({
    blob,
    fileName,
    uuid,
    maybe_title,
    maybe_visibility = Visibility.Public,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    maybe_title?: string;
    maybe_visibility?: Visibility;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/new_scene`;
    const options: Record<string, string | number | undefined> = {
      maybe_title,
      maybe_visibility: maybe_visibility?.toString(),
    };
    return this.Upload({ endpoint, blob, fileName, uuid, options });
  }

  public async UploadNewVideo({
    blob,
    fileName,
    uuid,
    maybe_title,
    maybe_visibility = Visibility.Public,
    maybe_style_name,
    maybe_scene_source_media_file_token,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    maybe_title?: string;
    maybe_visibility?: Visibility;
    maybe_style_name?: string;
    maybe_scene_source_media_file_token?: string;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/new_video`;
    const options: Record<string, string | number | undefined> = {
      is_intermediate_system_file: "true",
      maybe_title,
      maybe_visibility: maybe_visibility?.toString(),
      maybe_style_name,
      maybe_scene_source_media_file_token,
    };
    return this.Upload({ endpoint, blob, fileName, uuid, options });
  }

  public async UploadPmx({
    blob,
    fileName,
    uuid,
    engine_category,
    maybe_animation_type,
    maybe_duration_millis,
    maybe_title,
    maybe_visibility = Visibility.Public,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    engine_category?: string;
    maybe_animation_type?: string;
    maybe_duration_millis?: number;
    maybe_title?: string;
    maybe_visibility?: Visibility;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/pmx`;
    const options: Record<string, string | number | undefined> = {
      is_intermediate_system_file: "true",
      engine_category,
      maybe_animation_type,
      maybe_duration_millis,
      maybe_title,
      maybe_visibility,
    };
    return this.Upload({ endpoint, blob, fileName, uuid, options });
  }

  public async UploadSavedScene({
    blob,
    fileName,
    uuid,
    mediaToken,
  }: {
    blob: Blob;
    fileName: string;
    uuid: string;
    mediaToken: string;
  }): Promise<ApiResponse<string>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/upload/saved_scene/${mediaToken}`;
    const options: Record<string, string | number | undefined> = {};
    return this.Upload({ endpoint, blob, fileName, uuid, options });
  }
}
