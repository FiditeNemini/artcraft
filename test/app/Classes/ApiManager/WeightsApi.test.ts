import { authentication } from "~/signals";
import { UserInfo } from "~/models";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import {
  ListFeaturedWeightsRequest,
  ListWeightsByUserRequest,
  ListWeightsRequest,
  ScopedWeightCategory,
  ScopedWeightType,
  SearchWeightParams,
  WeightsApi,
} from "~/Classes/ApiManager/WeightsApi";
import {
  FilterEngineCategories,
  FilterMediaClasses,
  FilterMediaType,
  Visibility,
} from "~/enums";

const mockWeight = {
  cover_image: {
    default_cover: {
      color_index: 0,
      image_index: 0,
    },
    maybe_cover_image_public_bucket_path: "string",
  },
  created_at: "2024-06-17T11:11:03.533Z",
  creator: {
    default_avatar: {
      color_index: 0,
      image_index: 0,
    },
    display_name: "string",
    gravatar_hash: "string",
    user_token: "string",
    username: "string",
  },
  creator_set_visibility: "public",
  file_checksum_sha2: "string",
  file_size_bytes: 0,
  stats: {
    bookmark_count: 0,
    positive_rating_count: 0,
  },
  title: "string",
  updated_at: "2024-06-17T11:11:03.533Z",
  weight_category: "string",
  weight_token: "string",
  weight_type: "string",
};

EnvironmentVariables.initialize({ BASE_API: "http://localhost:3000" });

describe("UserBookmarksApi", () => {
  beforeAll(() => {
    authentication.userInfo.value = {
      user_token: "un1",
      username: "un1",
    } as UserInfo;
  });
  describe("run list tests", () => {
    const api = new WeightsApi();
    [
      {
        name: "ListWeightsByUser",
        function: api.ListWeightsByUser.bind(api),
        tests: [
          {
            name: "no params",
            endpoint: "http://localhost:3000/v1/weights/by_user/un1",
            query: {} as ListWeightsByUserRequest,
            fetchQuery: {},
          },
          {
            name: "all params",
            endpoint: "http://localhost:3000/v1/weights/by_user/user1",
            query: {
              pageIndex: 2,
              sortAscending: true,
              pageSize: 32,
              username: "user1",
              weightCategory: ["image_generation"],
              weightType: ["hifigan_tt2"],
            } as ListWeightsByUserRequest,
            fetchQuery: {
              page_index: "2",
              page_size: "32",
              sort_ascending: "true",
              weight_category: "image_generation",
              weight_type: "hifigan_tt2",
            },
          },
        ],
      },
      {
        name: "ListWeights",
        function: api.ListWeights.bind(api),
        tests: [
          {
            name: "no params",
            endpoint: "http://localhost:3000/v1/weights/list",
            query: {} as ListWeightsRequest,
            fetchQuery: {},
          },
          {
            name: "all params",
            endpoint: "http://localhost:3000/v1/weights/list",
            query: {
              cursor: "cursor1",
              cursorIsReversed: true,
              pageSize: 32,
              sortAscending: true,
              username: "user1",
              weightCategory: ["image_generation"],
              weightType: ["hifigan_tt2"],
            } as ListWeightsRequest,
            fetchQuery: {
              cursor: "cursor1",
              cursor_is_reversed: "true",
              page_size: "32",
              sort_ascending: "true",
              username: "user1",
              weight_category: "image_generation",
              weight_type: "hifigan_tt2",
            },
          },
        ],
      },
      {
        name: "ListWeightsFeatured",
        function: api.ListWeightsFeatured.bind(api),
        tests: [
          {
            name: "no params",
            endpoint: "http://localhost:3000/v1/weights/list_featured",
            query: {} as ListFeaturedWeightsRequest,
            fetchQuery: {},
          },
          {
            name: "all params",
            endpoint: "http://localhost:3000/v1/weights/list_featured",
            query: {
              sortAscending: true,
              pageSize: 32,
              cursor: "cursor1",
              cursorIsReversed: true,
              filterMediaClasses: [FilterMediaClasses.AUDIO],
              filterMediaType: [FilterMediaType.GLB, FilterMediaType.GLTF],
              filterEngineCategories: [
                FilterEngineCategories.ANIMATION,
                FilterEngineCategories.AUDIO,
                FilterEngineCategories.CHARACTER,
              ],
            } as ListFeaturedWeightsRequest,
            fetchQuery: {
              page_size: "32",
              sort_ascending: "true",
              cursor: "cursor1",
              cursor_is_reversed: "true",
              filter_media_classes: "audio",
              filter_media_type: "glb,gltf",
              filter_engine_categories: "animation,audio,character",
            },
          },
        ],
      },
      {
        name: "ListWeightsPinned",
        function: api.ListWeightsPinned.bind(api),
        tests: [
          {
            name: "success",
            endpoint: "http://localhost:3000/v1/weights/list_pinned",
            query: undefined,
            fetchQuery: undefined,
          },
        ],
      },
    ].forEach((testMethod) => {
      describe(testMethod.name, () => {
        afterEach(() => {
          jest.clearAllMocks();
        });

        testMethod.tests.forEach((test) => {
          it(test.name, async () => {
            jest.spyOn(api, "fetch").mockResolvedValue({
              results: [mockWeight],
              success: true,
            });
            const response = await testMethod.function(test.query as any);
            expect(api.fetch).toHaveBeenCalledWith(test.endpoint, {
              method: "GET",
              query: test.fetchQuery,
            });
            expect(response).toEqual({
              data: [mockWeight],
              success: true,
              errorMessage: undefined,
            });
          });
        });

        it("exception", async () => {
          jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
          const response = await testMethod.function(
            testMethod.tests[0].query as any,
          );
          expect(api.fetch).toHaveBeenCalledWith(testMethod.tests[0].endpoint, {
            method: "GET",
            query: testMethod.tests[0].fetchQuery,
          });
          expect(response).toEqual({
            success: false,
            errorMessage: "server error",
          });
        });
      });
    });
  });
  describe("run search test", () => {
    const api = new WeightsApi();
    [
      {
        name: "SearchWeights",
        function: api.SearchWeights.bind(api),
        endpoint: "http://localhost:3000/v1/weights/search",
        body: {
          ietfLanguageSubtag: "ietf1",
          searchTerm: "st1",
          weightCategory: ScopedWeightCategory.IMAGE_GENERATION,
          weightType: ScopedWeightType.HIFIGAN_TT2,
        } as SearchWeightParams,
        fetchBody: {
          ietf_language_subtag: "ietf1",
          search_term: "st1",
          weight_category: "image_generation",
          weight_type: "hifigan_tt2",
        },
      },
    ].forEach((testMethod) => {
      describe(testMethod.name, () => {
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("success", async () => {
          jest.spyOn(api, "fetch").mockResolvedValue({
            weights: [mockWeight],
            success: true,
          });
          const response = await testMethod.function(testMethod.body);
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: "POST",
            body: testMethod.fetchBody,
            query: undefined,
          });
          expect(response).toEqual({
            data: [mockWeight],
            success: true,
            errorMessage: undefined,
          });
        });

        it("exception", async () => {
          jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
          const response = await testMethod.function(testMethod.body);
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: "POST",
            body: testMethod.fetchBody,
            query: undefined,
          });
          expect(response).toEqual({
            success: false,
            errorMessage: "server error",
          });
        });
      });
    });
  });
  describe("run get test", () => {
    const api = new WeightsApi();
    [
      {
        name: "GetWeightByToken",
        function: api.GetWeightByToken.bind(api),
        endpoint: "http://localhost:3000/v1/weights/weight/wt1",
        params: {
          weightToken: "wt1",
        },
      },
    ].forEach((testMethod) => {
      describe(testMethod.name, () => {
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("success", async () => {
          jest.spyOn(api, "fetch").mockResolvedValue({
            ...mockWeight,
            success: true,
          });
          const response = await testMethod.function(testMethod.params);
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: "GET",
            body: undefined,
            query: undefined,
          });
          expect(response).toEqual({
            data: mockWeight,
            success: true,
            errorMessage: undefined,
          });
        });

        it("exception", async () => {
          jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
          const response = await testMethod.function(testMethod.params);
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: "GET",
            body: undefined,
            query: undefined,
          });
          expect(response).toEqual({
            success: false,
            errorMessage: "server error",
          });
        });
      });
    });
  });
  describe("run update/delete tests", () => {
    const api = new WeightsApi();
    [
      {
        name: "UpdateWeightByToken",
        function: api.UpdateWeightByToken.bind(api),
        endpoint: "http://localhost:3000/v1/weights/weight/wt1",
        method: "POST",
        paramsIn: {
          weightToken: "wt1",
          coverImageMediaFileToken: "cimft1",
          descriptionMarkdown: "descr1",
          title: "title1",
          visibility: Visibility.Private,
        },
        paramsTest: {
          cover_image_media_file_token: "cimft1",
          description_markdown: "descr1",
          title: "title1",
          visibility: Visibility.Private,
        },
      },
      {
        name: "DeleteWeightByToken",
        function: api.DeleteWeightByToken.bind(api),
        endpoint: "http://localhost:3000/v1/weights/weight/wt1",
        method: "DELETE",
        paramsIn: {
          weightToken: "wt1",
        },
        paramsTest: {
          as_mod: true,
          set_delete: true,
        },
      },
      {
        name: "UpdateWeightCoverImageByToken",
        function: api.UpdateWeightCoverImageByToken.bind(api),
        endpoint: "http://localhost:3000/v1/weights/wt1/cover_image",
        method: "POST",
        paramsIn: {
          weightToken: "wt1",
          coverImageMediaFileToken: "cimft1",
        },
        paramsTest: {
          cover_image_media_file_token: "cimft1",
        },
      },
    ].forEach((testMethod) => {
      describe(testMethod.name, () => {
        afterEach(() => {
          jest.clearAllMocks();
        });

        it(test.name, async () => {
          jest.spyOn(api, "fetch").mockResolvedValue({
            success: true,
          });
          const response = await testMethod.function(
            testMethod.paramsIn as any,
          );
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: testMethod.method,
            body: testMethod.paramsTest,
            query: undefined,
          });
          expect(response).toEqual({
            success: true,
            errorMessage: undefined,
          });
        });

        it("failure", async () => {
          jest.spyOn(api, "fetch").mockResolvedValue({ BadInput: "bad input" });
          const response = await testMethod.function(
            testMethod.paramsIn as any,
          );
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: testMethod.method,
            body: testMethod.paramsTest,
            query: undefined,
          });
          expect(response).toEqual({
            success: false,
            errorMessage: "bad input",
          });
        });

        it("exception", async () => {
          jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
          const response = await testMethod.function(
            testMethod.paramsIn as any,
          );
          expect(api.fetch).toHaveBeenCalledWith(testMethod.endpoint, {
            method: testMethod.method,
            body: testMethod.paramsTest,
            query: undefined,
          });
          expect(response).toEqual({
            success: false,
            errorMessage: "server error",
          });
        });
      });
    });
  });
});
