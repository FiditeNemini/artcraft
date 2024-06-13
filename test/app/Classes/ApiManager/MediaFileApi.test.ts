import {
  FilterEngineCategories,
  FilterMediaClasses,
  FilterMediaType,
  MediaFilesApi,
} from "~/Classes/ApiManager/MediaFilesApi";
import { authentication } from "~/signals";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { UserInfo } from "~/models";

describe("MediaFilesApi", () => {
  beforeAll(() => {
    authentication.userInfo.value = {
      user_token: "ut1",
      username: "un1",
    } as UserInfo;
    EnvironmentVariables.initialize({ BASE_API: "http://localhost:3000" });
  });

  const mediaFile = {
    cover_image: {
      default_cover: {
        color_index: 0,
        image_index: 0,
      },
      maybe_cover_image_public_bucket_path: "string",
    },
    created_at: "2024-06-13T12:33:48.693Z",
    creator_set_visibility: "public",
    is_emulated_media_file: true,
    maybe_animation_type: "ar_kit",
    maybe_batch_token: "string",
    maybe_creator_user: {
      default_avatar: {
        color_index: 0,
        image_index: 0,
      },
      display_name: "string",
      gravatar_hash: "string",
      user_token: "string",
      username: "string",
    },
    maybe_duration_millis: 0,
    maybe_engine_category: "scene",
    maybe_media_subtype: "mixamo",
    maybe_model_weight_info: {
      maybe_cover_image_public_bucket_path: "string",
      maybe_weight_creator: {
        default_avatar: {
          color_index: 0,
          image_index: 0,
        },
        display_name: "string",
        gravatar_hash: "string",
        user_token: "string",
        username: "string",
      },
      title: "string",
      weight_category: "image_generation",
      weight_token: "string",
      weight_type: "hifigan_tt2",
    },
    maybe_original_filename: "string",
    maybe_prompt_token: "string",
    maybe_style_name: "anime_2_5d",
    maybe_text_transcript: "string",
    maybe_title: "string",
    media_class: "unknown",
    media_type: "audio",
    public_bucket_path: "string",
    stats: {
      bookmark_count: 0,
      positive_rating_count: 0,
    },
    token: "string",
    updated_at: "2024-06-13T12:33:48.693Z",
  };

  describe("FetchBatch", () => {
    it("success", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        media_files: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListMediaFilesByTokens({
        mediaTokens: ["t1", "t2", "t3"],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/batch",
        {
          method: "GET",
          query: {
            tokens: "t1,t2,t3",
          },
        },
      );
      expect(response).toEqual({
        success: true,
        data: [mediaFile],
        errorMessage: undefined,
      });
    });

    it("exception", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest
        .spyOn(mediaFilesApi, "fetch")
        .mockRejectedValue(new Error("server error"));
      const response = await mediaFilesApi.ListMediaFilesByTokens({
        mediaTokens: ["t1", "t2", "t3"],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/batch",
        {
          method: "GET",
          query: {
            tokens: "t1,t2,t3",
          },
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "server error",
      });
    });
  });

  describe("LoadMediaFile", () => {
    it("success", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest
        .spyOn(mediaFilesApi, "fetch")
        .mockResolvedValueOnce({ success: true, media_file: mediaFile });
      const response = await mediaFilesApi.GetMediaFileByToken({
        mediaFileToken: "mft1",
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/file/mft1",
        {
          method: "GET",
          body: undefined,
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: true,
        data: mediaFile,
      });
    });

    it("exception", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest
        .spyOn(mediaFilesApi, "fetch")
        .mockRejectedValue(new Error("server error"));
      const response = await mediaFilesApi.GetMediaFileByToken({
        mediaFileToken: "mft1",
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/file/mft1",
        {
          method: "GET",
          body: undefined,
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "server error",
      });
    });
  });

  describe("ListUserMediaFiles", () => {
    it("no parameters", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        results: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListUserMediaFiles({});
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list/user/un1",
        {
          method: "GET",
          query: {
            filter_engine_categories: undefined,
            filter_media_classes: undefined,
            filter_media_type: undefined,
          },
        },
      );
      expect(response).toEqual({
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        success: true,
        data: [mediaFile],
      });
    });

    it("page_size and filter_engine_categories", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        results: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListUserMediaFiles({
        page_size: 22,
        filter_engine_categories: [
          FilterEngineCategories.ANIMATION,
          FilterEngineCategories.CHARACTER,
        ],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list/user/un1",
        {
          method: "GET",
          query: {
            filter_engine_categories: "animation,character",
            filter_media_classes: undefined,
            filter_media_type: undefined,
            page_size: 22,
          },
        },
      );
      expect(response).toEqual({
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        success: true,
        data: [mediaFile],
      });
    });

    it("with a bunch", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        results: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListUserMediaFiles({
        sort_ascending: true,
        page_index: 8,
        filter_media_classes: [FilterMediaClasses.AUDIO],
        filter_media_type: [FilterMediaType.GLB, FilterMediaType.GLTF],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list/user/un1",
        {
          method: "GET",
          query: {
            filter_engine_categories: undefined,
            filter_media_classes: "audio",
            filter_media_type: "glb,gltf",
            sort_ascending: true,
            page_index: 8,
          },
        },
      );
      expect(response).toEqual({
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        success: true,
        data: [mediaFile],
      });
    });

    it("exception", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest
        .spyOn(mediaFilesApi, "fetch")
        .mockRejectedValue(new Error("server error"));
      const response = await mediaFilesApi.ListUserMediaFiles({
        sort_ascending: true,
        page_index: 8,
        filter_media_classes: [FilterMediaClasses.AUDIO],
        filter_media_type: [FilterMediaType.GLB, FilterMediaType.GLTF],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list/user/un1",
        {
          method: "GET",
          query: {
            filter_engine_categories: undefined,
            filter_media_classes: "audio",
            filter_media_type: "glb,gltf",
            sort_ascending: true,
            page_index: 8,
          },
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "server error",
      });
    });
  });

  describe("ListFeaturedMediaFiles", () => {
    it("no parameters", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        pagination: {
          cursor_is_reversed: false,
          maybe_next: "mn1",
          maybe_previous: "mp1",
        },
        results: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListFeaturedMediaFiles({});
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list_featured",
        {
          method: "GET",
          query: {
            filter_engine_categories: undefined,
            filter_media_classes: undefined,
            filter_media_type: undefined,
          },
        },
      );
      expect(response).toEqual({
        pagination: {
          cursor_is_reversed: false,
          maybe_next: "mn1",
          maybe_previous: "mp1",
        },
        errorMessage: undefined,
        success: true,
        data: [mediaFile],
      });
    });

    it("page_size and filter_engine_categories", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        pagination: {
          cursor_is_reversed: false,
          maybe_next: "mn1",
          maybe_previous: "mp1",
        },
        results: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListFeaturedMediaFiles({
        page_size: 22,
        filter_engine_categories: [
          FilterEngineCategories.ANIMATION,
          FilterEngineCategories.CHARACTER,
        ],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list_featured",
        {
          method: "GET",
          query: {
            filter_engine_categories: "animation,character",
            filter_media_classes: undefined,
            filter_media_type: undefined,
            page_size: 22,
          },
        },
      );
      expect(response).toEqual({
        pagination: {
          cursor_is_reversed: false,
          maybe_next: "mn1",
          maybe_previous: "mp1",
        },
        success: true,
        data: [mediaFile],
      });
    });

    it("with a bunch", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest.spyOn(mediaFilesApi, "fetch").mockResolvedValueOnce({
        pagination: {
          cursor_is_reversed: false,
          maybe_next: "mn1",
          maybe_previous: "mp1",
        },
        results: [mediaFile],
        success: true,
      });
      const response = await mediaFilesApi.ListFeaturedMediaFiles({
        sort_ascending: true,
        cursor: "cursor",
        cursor_is_reversed: false,
        filter_media_classes: [FilterMediaClasses.AUDIO],
        filter_media_type: [FilterMediaType.GLB, FilterMediaType.GLTF],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list_featured",
        {
          method: "GET",
          query: {
            filter_engine_categories: undefined,
            filter_media_classes: "audio",
            filter_media_type: "glb,gltf",
            sort_ascending: true,
            cursor: "cursor",
            cursor_is_reversed: false,
          },
        },
      );
      expect(response).toEqual({
        pagination: {
          cursor_is_reversed: false,
          maybe_next: "mn1",
          maybe_previous: "mp1",
        },
        success: true,
        data: [mediaFile],
      });
    });

    it("exception", async () => {
      const mediaFilesApi = new MediaFilesApi();
      jest
        .spyOn(mediaFilesApi, "fetch")
        .mockRejectedValue(new Error("server error"));
      const response = await mediaFilesApi.ListFeaturedMediaFiles({
        sort_ascending: true,
        cursor: "cursor",
        cursor_is_reversed: false,
        filter_media_classes: [FilterMediaClasses.AUDIO],
        filter_media_type: [FilterMediaType.GLB, FilterMediaType.GLTF],
      });
      expect(mediaFilesApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/list_featured",
        {
          method: "GET",
          query: {
            filter_engine_categories: undefined,
            filter_media_classes: "audio",
            filter_media_type: "glb,gltf",
            sort_ascending: true,
            cursor: "cursor",
            cursor_is_reversed: false,
          },
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "server error",
      });
    });
  });
});
