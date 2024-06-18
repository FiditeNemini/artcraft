import { authentication } from "~/signals";
import { UserInfo } from "~/models";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { AnalyticsApi } from "~/Classes/ApiManager/AnalyticsApi";

describe("AnalyticsApi", () => {
  beforeAll(() => {
    authentication.userInfo.value = {
      user_token: "un1",
      username: "un1",
    } as UserInfo;
    EnvironmentVariables.initialize({ BASE_API: "http://localhost:3000" });
  });
  describe("PostAnalytics", () => {
    it("success", async () => {
      const api = new AnalyticsApi();
      jest.spyOn(api, "fetch").mockResolvedValue({
        log_token: "lt1",
        success: true,
      });
      const response = await api.PostAnalytics({
        maybeLastAction: "mla1",
        maybeLogToken: "mlt1",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/analytics/log_session",
        {
          method: "POST",
          body: {
            maybe_last_action: "mla1",
            maybe_log_token: "mlt1",
          },
          query: undefined,
        },
      );
      expect(response).toEqual({
        data: "lt1",
        success: true,
        errorMessage: undefined,
      });
    });

    it("failure", async () => {
      const api = new AnalyticsApi();
      jest.spyOn(api, "fetch").mockResolvedValue({ BadInput: "bad input" });
      const response = await api.PostAnalytics({
        maybeLastAction: "mla1",
        maybeLogToken: "mlt1",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/analytics/log_session",
        {
          method: "POST",
          body: {
            maybe_last_action: "mla1",
            maybe_log_token: "mlt1",
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
      const api = new AnalyticsApi();
      jest.spyOn(api, "fetch").mockRejectedValue(new Error("server error"));
      const response = await api.PostAnalytics({
        maybeLastAction: "mla1",
        maybeLogToken: "mlt1",
      });
      expect(api.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/analytics/log_session",
        {
          method: "POST",
          body: {
            maybe_last_action: "mla1",
            maybe_log_token: "mlt1",
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
});
