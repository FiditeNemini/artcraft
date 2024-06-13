import { authentication } from "~/signals";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { JobsApi } from "~/Classes/ApiManager/JobsApi";
import { UserInfo } from "~/models";

const mockJob = {
  created_at: "2024-06-13T13:28:18.610Z",
  job_token: "string",
  maybe_result: {
    entity_token: "string",
    entity_type: "string",
    maybe_public_bucket_media_path: "string",
    maybe_successfully_completed_at: "2024-06-13T13:28:18.610Z",
  },
  request: {
    inference_category: "lipsync_animation",
    maybe_model_title: "string",
    maybe_model_token: "string",
    maybe_model_type: "string",
    maybe_raw_inference_text: "string",
    maybe_style_name: "anime_2_5d",
  },
  status: {
    attempt_count: 0,
    maybe_assigned_cluster: "string",
    maybe_assigned_worker: "string",
    maybe_extra_status_description: "string",
    maybe_failure_category: "face_not_detected",
    maybe_first_started_at: "2024-06-13T13:28:18.610Z",
    requires_keepalive: true,
    status: "pending",
  },
  updated_at: "2024-06-13T13:28:18.610Z",
};

describe("JobsApi", () => {
  beforeAll(() => {
    authentication.userInfo.value = {
      user_token: "un1",
      username: "un1",
    } as UserInfo;
    EnvironmentVariables.initialize({ BASE_API: "http://localhost:3000" });
  });
  describe("FetchRecentJobs", () => {
    it("fetch data", async () => {
      const jobsApi = new JobsApi();
      jest.spyOn(jobsApi, "fetch").mockResolvedValue({
        success: true,
        jobs: [mockJob],
      });
      const response = await jobsApi.ListRecentJobs();
      expect(jobsApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/jobs/session",
        {
          method: "GET",
          body: undefined,
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: true,
        data: [mockJob],
      });
    });

    it("exception", async () => {
      const jobsApi = new JobsApi();
      jest.spyOn(jobsApi, "fetch").mockRejectedValue(new Error("server error"));
      const response = await jobsApi.ListRecentJobs();
      expect(jobsApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/jobs/session",
        {
          method: "GET",
          body: undefined,
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: false,
        errorMessage: "server error",
      });
    });
  });

  describe("DeleteJob", () => {
    it("success", async () => {
      const jobsApi = new JobsApi();
      jest.spyOn(jobsApi, "fetch").mockResolvedValue({
        success: true,
      });
      const response = await jobsApi.DeleteJobByToken("token1");
      expect(jobsApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/jobs/job/token1",
        {
          method: "DELETE",
          body: undefined,
          query: undefined,
        },
      );
      expect(response).toEqual({
        success: true,
      });
    });

    it("exception", async () => {
      const jobsApi = new JobsApi();
      jest.spyOn(jobsApi, "fetch").mockRejectedValue(new Error("server error"));
      const response = await jobsApi.DeleteJobByToken("token1");
      expect(jobsApi.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/jobs/job/token1",
        {
          method: "DELETE",
          body: undefined,
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
