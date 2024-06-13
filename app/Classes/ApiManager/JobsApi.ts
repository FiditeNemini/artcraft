import { ApiManager, ApiResponse } from "./ApiManager";
import { Job } from "~/models";

export class JobsApi extends ApiManager {
  public ListRecentJobs(): Promise<ApiResponse<Job[]>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/jobs/session`;

    return this.get<{
      success: boolean;
      jobs: Job[];
      error_reason?: string;
    }>({ endpoint })
      .then((response) => ({
        success: response.success,
        data: response.jobs,
      }))
      .catch((err) => {
        return { success: false, errorMessage: err.message };
      });
  }

  public DeleteJobByToken(jobToken: string): Promise<ApiResponse<undefined>> {
    const endpoint = `${this.ApiTargets.BaseApi}/v1/jobs/job/${jobToken}`;

    return this.delete<
      undefined,
      {
        success: boolean;
      }
    >({ endpoint })
      .then((response) => ({
        success: response.success,
      }))
      .catch((err) => {
        return { success: false, errorMessage: err.message };
      });
  }
}
