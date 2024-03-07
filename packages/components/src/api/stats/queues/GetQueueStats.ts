import { ApiConfig } from "../../ApiConfig";

export interface GetQueueStatsSuccessResponse {
  success: boolean,
  cache_time: Date,
  refresh_interval_millis: number,
  inference: InferenceInfo,
  legacy_tts: LegacyTtsInfo,
}

export interface InferenceInfo {
  total_pending_job_count: number,
  pending_job_count: number,
  by_queue: ByQueueStats,
}

export interface ByQueueStats {
  pending_face_animation_jobs: number,
  pending_rvc_jobs: number,
  pending_svc_jobs: number,
  pending_tacotron2_jobs: number,
  pending_voice_designer: number,
  pending_stable_diffusion: number,
}

export interface LegacyTtsInfo {
  pending_job_count: number,
}

export interface GetQueueStatsErrorResponse {
}

export type GetQueueStatsResponse = GetQueueStatsSuccessResponse | GetQueueStatsErrorResponse;

export function GetQueueStatsIsOk(response: GetQueueStatsResponse): response is GetQueueStatsSuccessResponse {
  return response.hasOwnProperty('cache_time');
}

export function GetQueueStatsIsErr(response: GetQueueStatsResponse): response is GetQueueStatsErrorResponse {
  return !response.hasOwnProperty('cache_time');
}

export async function GetQueueStats() : Promise<GetQueueStatsResponse> {
  const endpoint = new ApiConfig().getQueueStats();

  return fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  })
  .then(res => res.json())
  .then(res => {
    if (res && 'success' in res && res['success']) {
      // NB: Timestamps aren't converted to Date objects on their own!
      res['cache_time'] = new Date(res['cache_time']);
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}
