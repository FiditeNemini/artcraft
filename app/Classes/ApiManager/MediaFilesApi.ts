import {
  MediaFile,
  MediaInfo,
  Pagination,
  PaginationInfinite,
} from "~/pages/PageEnigma/models";
import { ApiManager, ApiResponse } from "./ApiManager";
import { authentication } from "~/signals";

export enum FilterMediaClasses {
  AUDIO = "audio",
  IMAGE = "image",
  VIDEO = "video",
}

export enum FilterMediaType {
  SCENE_JSON = "scene_json",
  GLB = "glb",
  GLTF = "gltf",
}

export enum FilterEngineCategories {
  ANIMATION = "animation",
  AUDIO = "audio",
  CHARACTER = "character",
  EXPRESSION = "expression",
  OBJECT = "object",
  SCENE = "scene",
}

interface ListFeaturedMediaQuery {
  sort_ascending?: boolean;
  page_size?: number;
  cursor?: string;
  cursor_is_reversed?: boolean;
  filter_media_classes?: FilterMediaClasses[];
  filter_media_type?: FilterMediaType[];
  filter_engine_categories?: FilterEngineCategories[];
}

interface ListUserMediaQuery {
  sort_ascending?: boolean;
  page_size?: number;
  page_index?: number;
  filter_media_classes?: FilterMediaClasses[];
  filter_media_type?: FilterMediaType[];
  filter_engine_categories?: FilterEngineCategories[];
}

export class MediaFilesApi extends ApiManager {
  public async ListMediaFilesByTokens({
    mediaTokens,
  }: {
    mediaTokens: string[];
  }): Promise<ApiResponse<MediaFile[]>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/batch`;

    return await this.get<{
      success: boolean;
      media_files: MediaFile[];
      error_reason?: string;
    }>({ endpoint, query: { tokens: mediaTokens.join(",") } })
      .then((response) => ({
        success: response.success,
        data: response.media_files,
      }))
      .catch((err) => {
        return { success: false, errorMessage: err.message };
      });
  }

  public async GetMediaFileByToken({
    mediaFileToken,
  }: {
    mediaFileToken: string;
  }): Promise<ApiResponse<MediaFile>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/file/${mediaFileToken}`;
    return await this.get<{
      success: boolean;
      media_file: MediaFile;
    }>({ endpoint })
      .then((response) => ({
        success: response.success,
        data: response.media_file,
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }

  public async ListUserMediaFiles(
    query: ListUserMediaQuery,
  ): Promise<ApiResponse<MediaInfo[], PaginationInfinite>> {
    const userName = authentication.userInfo.value?.username;
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/list/user/${userName}`;
    const queryWithStrings = {
      ...query,
      filter_media_classes: query.filter_media_classes
        ? query.filter_media_classes.join(",")
        : undefined,
      filter_media_type: query.filter_media_type
        ? query.filter_media_type.join(",")
        : undefined,
      filter_engine_categories: query.filter_engine_categories
        ? query.filter_engine_categories.join(",")
        : undefined,
    };
    return await this.get<{
      success: boolean;
      results: MediaInfo[];
      pagination?: PaginationInfinite;
    }>({ endpoint, query: queryWithStrings })
      .then((response) => ({
        success: response.success,
        data: response.results ?? [],
        pagination: response.pagination,
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }

  public async ListFeaturedMediaFiles(
    query: ListFeaturedMediaQuery,
  ): Promise<ApiResponse<MediaInfo[], Pagination>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/media_files/list_featured`;
    const queryWithStrings = {
      ...query,
      filter_media_classes: query.filter_media_classes
        ? query.filter_media_classes.join(",")
        : undefined,
      filter_media_type: query.filter_media_type
        ? query.filter_media_type.join(",")
        : undefined,
      filter_engine_categories: query.filter_engine_categories
        ? query.filter_engine_categories.join(",")
        : undefined,
    };
    return await this.get<{
      success: boolean;
      results: MediaInfo[];
      pagination: Pagination;
    }>({ endpoint, query: queryWithStrings })
      .then((response) => ({
        success: true,
        data: response.results,
        pagination: response.pagination,
      }))
      .catch((err) => {
        return {
          success: false,
          errorMessage: err.message,
        };
      });
  }
}
