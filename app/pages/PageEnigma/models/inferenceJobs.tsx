export interface InferenceJob {
  version: number;
  job_id: string;
  job_type: string;
  job_status: string;
  result?: any;
}
