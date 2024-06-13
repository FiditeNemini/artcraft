import { authentication } from "~/signals";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { MediaUploadApi } from "~/Classes/ApiManager/MediaUploadApi";
import { Visibility } from "~/enums";
import { UserInfo } from "~/models";

describe("MediaUploadApi", () => {
  beforeAll(() => {
    authentication.userInfo.value = {
      user_token: "un1",
      username: "un1",
    } as UserInfo;
    EnvironmentVariables.initialize({ BASE_API: "http://localhost:3000" });
  });

  describe("UploadImage", () => {
    it("no parameters", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        media_file_token: "mft1",
        success: true,
      });
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadImage({
        blob: blob,
        fileName: "some file name",
        uuid,
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_visibility: Visibility.Public,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/image",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        data: "mft1",
        success: true,
        errorMessage: undefined,
      });
    });
    it("all parameters", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        media_file_token: "mft1",
        success: true,
      });
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadImage({
        blob: blob,
        fileName: "some file name",
        uuid,
        title: "title",
        visibility: Visibility.Private,
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_title: "title",
        maybe_visibility: Visibility.Private,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/image",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        data: "mft1",
        success: true,
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        BadInput: "error error",
      });
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadImage({
        blob: blob,
        fileName: "some file name",
        uuid,
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_visibility: Visibility.Public,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/image",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        data: undefined,
        success: false,
        errorMessage: "error error",
      });
    });

    it("exception", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest
        .spyOn(mediaUploadApi, "fetch")
        .mockRejectedValue(new Error("error error"));
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadImage({
        blob: blob,
        fileName: "some file name",
        uuid,
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_visibility: Visibility.Public,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/image",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        data: undefined,
        success: false,
        errorMessage: "error error",
      });
    });
  });

  describe("UploadVideo", () => {
    it("success all parameters", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        media_file_token: "mft2",
        success: true,
      });
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadVideo({
        blob: blob,
        fileName: "some file name",
        uuid,
        title: "title",
        styleName: "style",
        sceneSourceMediaFileToken: "ssmft1",
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_title: "title",
        maybe_visibility: Visibility.Public,
        maybe_style_name: "style",
        maybe_scene_source_media_file_token: "ssmft1",
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/new_video",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        success: true,
        data: "mft2",
        errorMessage: undefined,
      });
    });

    it("success few parameters", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        media_file_token: "mft2",
        success: true,
      });
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadVideo({
        blob: blob,
        fileName: "some file name",
        uuid,
        title: "title",
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_title: "title",
        maybe_visibility: Visibility.Public,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/new_video",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        success: true,
        data: "mft2",
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        BadInput: "error",
      });
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadVideo({
        blob: blob,
        fileName: "some file name",
        uuid,
        title: "title",
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_title: "title",
        maybe_visibility: Visibility.Public,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/new_video",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "error",
      });
    });

    it("exception", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockRejectedValue(new Error("error"));
      const blob = new Blob(["my blob data"]);
      const uuid = "some uuid";
      const response = await mediaUploadApi.UploadVideo({
        blob: blob,
        fileName: "some file name",
        uuid,
        title: "title",
      });
      const formData = new FormData();
      formData.append("uuid_idempotency_token", uuid);
      Object.entries({
        is_intermediate_system_file: "true",
        maybe_title: "title",
        maybe_visibility: Visibility.Public,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", blob, "some file name");
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/upload/new_video",
        {
          method: "POST",
          body: formData,
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "error",
      });
    });
  });

  describe("UploadThumbnail", () => {
    it("success", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        success: true,
      });
      const response = await mediaUploadApi.UploadThumbnail({
        mediaFileToken: "mft1",
        imageToken: "it1",
      });
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/cover_image/mft1",
        {
          method: "POST",
          body: { cover_image_media_file_token: "it1" },
          query: undefined,
        },
      );
      expect(response).toEqual({ success: true });
    });

    it("failure", async () => {
      const mediaUploadApi = new MediaUploadApi();
      jest.spyOn(mediaUploadApi, "fetch").mockResolvedValueOnce({
        BadInput: "bi1",
      });
      const response = await mediaUploadApi.UploadThumbnail({
        mediaFileToken: "mft1",
        imageToken: "it1",
      });
      expect(mediaUploadApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/media_files/cover_image/mft1",
        {
          method: "POST",
          body: { cover_image_media_file_token: "it1" },
          query: undefined,
        },
      );
      expect(response).toEqual({ success: false, errorMessage: "bi1" });
    });
  });
});
