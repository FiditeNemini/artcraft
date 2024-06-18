import { authentication } from "~/signals";
import { UserInfo } from "~/models";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { BetaKeysApi } from "~/Classes/ApiManager/BetaKeysApi";

const mockBetaKey = {
  created_at: "2024-06-16T00:06:04.724Z",
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
  is_distributed: true,
  key_value: "string",
  maybe_note: "string",
  maybe_note_html: "string",
  maybe_redeemed_at: "2024-06-16T00:06:04.724Z",
  maybe_redeemer: {
    default_avatar: {
      color_index: 0,
      image_index: 0,
    },
    display_name: "string",
    gravatar_hash: "string",
    user_token: "string",
    username: "string",
  },
  maybe_referrer: {
    default_avatar: {
      color_index: 0,
      image_index: 0,
    },
    display_name: "string",
    gravatar_hash: "string",
    user_token: "string",
    username: "string",
  },
  product: "studio",
  token: "string",
};

describe("BetaKeysApi", () => {
  beforeAll(() => {
    authentication.userInfo.value = {
      user_token: "un1",
      username: "un1",
    } as UserInfo;
    EnvironmentVariables.initialize({ BASE_API: "http://localhost:3000" });
  });
  describe("CreateBetaKey", () => {
    it("success", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({
        beta_keys: ["bk1", "bk2"],
        success: true,
      });
      const response = await api.CreateBetaKey({
        maybeNote: "mn1",
        maybeReferrerUsername: "mru1",
        numberOfKeys: 3,
        uuidIdempotencyToken: "uuid",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/create",
        {
          method: "POST",
          body: {
            maybe_note: "mn1",
            maybe_referrer_username: "mru1",
            number_of_keys: 3,
            uuid_idempotency_token: "uuid",
          },
          query: undefined,
        },
      );
      expect(response).toEqual({
        data: ["bk1", "bk2"],
        success: true,
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({ BadInput: "bad input" });
      const response = await api.CreateBetaKey({
        maybeNote: "mn1",
        maybeReferrerUsername: "mru1",
        numberOfKeys: 3,
        uuidIdempotencyToken: "uuid",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/create",
        {
          method: "POST",
          body: {
            maybe_note: "mn1",
            maybe_referrer_username: "mru1",
            number_of_keys: 3,
            uuid_idempotency_token: "uuid",
          },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "bad input",
      });
    });

    it("exception", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
      const response = await api.CreateBetaKey({
        maybeNote: "mn1",
        maybeReferrerUsername: "mru1",
        numberOfKeys: 3,
        uuidIdempotencyToken: "uuid",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/create",
        {
          method: "POST",
          body: {
            maybe_note: "mn1",
            maybe_referrer_username: "mru1",
            number_of_keys: 3,
            uuid_idempotency_token: "uuid",
          },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "server error",
      });
    });
  });

  describe("ListBetaKeys", () => {
    it("no params", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({
        beta_keys: [mockBetaKey],
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        success: true,
      });
      const response = await api.ListBetaKeys({});
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/list",
        {
          method: "GET",
          query: {
            maybe_referrer_username: undefined,
            only_list_remaining: undefined,
            page_index: undefined,
            page_size: undefined,
            sort_ascending: undefined,
          },
        },
      );
      expect(response).toEqual({
        success: true,
        data: [mockBetaKey],
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        errorMessage: undefined,
      });
    });

    it("all params", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({
        beta_keys: [mockBetaKey],
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        success: true,
      });
      const response = await api.ListBetaKeys({
        sortAscending: true,
        pageSize: 88,
        pageIndex: 2,
        maybeReferrerUsername: "mru1",
        onlyListRemaining: false,
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/list",
        {
          method: "GET",
          query: {
            maybe_referrer_username: "mru1",
            only_list_remaining: false,
            page_index: 2,
            page_size: 88,
            sort_ascending: true,
          },
        },
      );
      expect(response).toEqual({
        success: true,
        data: [mockBetaKey],
        pagination: {
          current: 0,
          total_page_count: 0,
        },
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({ BadInput: "bad input" });
      const response = await api.ListBetaKeys({});
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/list",
        {
          method: "GET",
          query: {
            maybe_referrer_username: undefined,
            only_list_remaining: undefined,
            page_index: undefined,
            page_size: undefined,
            sort_ascending: undefined,
          },
        },
      );
      expect(response).toEqual({
        success: false,
        data: undefined,
        errorMessage: "bad input",
      });
    });

    it("exception", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
      const response = await api.ListBetaKeys({});
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/list",
        {
          method: "GET",
          query: {
            maybe_referrer_username: undefined,
            only_list_remaining: undefined,
            page_index: undefined,
            page_size: undefined,
            sort_ascending: undefined,
          },
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "server error",
      });
    });
  });

  describe("RedeemBetaKey", () => {
    it("success", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({
        success: true,
      });
      const response = await api.RedeemBetaKey({
        betaKey: "bk1",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/redeem",
        {
          method: "POST",
          body: { beta_key: "bk1" },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: true,
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({ BadInput: "bad input" });
      const response = await api.RedeemBetaKey({
        betaKey: "bk1",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/redeem",
        {
          method: "POST",
          body: { beta_key: "bk1" },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "bad input",
      });
    });

    it("exception", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
      const response = await api.RedeemBetaKey({
        betaKey: "bk1",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/redeem",
        {
          method: "POST",
          body: { beta_key: "bk1" },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "server error",
      });
    });
  });

  describe("UpdateBetaKeyNote", () => {
    it("success", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({
        success: true,
      });
      const response = await api.UpdateBetaKeyNote({
        token: "t1",
        note: "a note",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/t1/note",
        {
          method: "POST",
          body: { note: "a note" },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: true,
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockResolvedValue({ BadInput: "bad input" });
      const response = await api.UpdateBetaKeyNote({
        token: "t1",
        note: "a note",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/t1/note",
        {
          method: "POST",
          body: { note: "a note" },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "bad input",
      });
    });

    it("exception", async () => {
      const api = new BetaKeysApi();
      jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
      const response = await api.UpdateBetaKeyNote({
        token: "t1",
        note: "a note",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/beta_keys/t1/note",
        {
          method: "POST",
          body: { note: "a note" },
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "server error",
      });
    });
  });
});
