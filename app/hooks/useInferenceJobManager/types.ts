import { Job } from "~/models";

export type GetJobsResponse = {
  success: boolean;
  error_message?: string;
  jobs?: Job[];
};
