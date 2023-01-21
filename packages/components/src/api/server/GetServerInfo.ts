import { ApiConfig } from "../ApiConfig";

export interface GetServerInfoSuccessResponse {
  success: boolean,
  server_build_sha: string,
  server_hostname: string,
}

export interface GetServerInfoErrorResponse {
}

export type GetServerInfoResponse = GetServerInfoSuccessResponse | GetServerInfoErrorResponse;

export function GetServerInfoIsOk(response: GetServerInfoResponse): response is GetServerInfoSuccessResponse {
  return response.hasOwnProperty('server_build_sha');
}

export function GetServerInfoIsErr(response: GetServerInfoResponse): response is GetServerInfoErrorResponse {
  return !response.hasOwnProperty('server_build_sha');
}

export async function GetServerInfo() : Promise<GetServerInfoResponse> {
  const endpoint = new ApiConfig().getServerInfo();

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
