import { ApiConfig } from "../../../common/ApiConfig";

export interface Leaderboard {
  success: boolean,
  tts_leaderboard: Array<LeaderboardEntryForList>
  w2l_leaderboard: Array<LeaderboardEntryForList>
}

export interface LeaderboardEntryForList {
  username: string,
  display_name: string,
  gravatar_hash: string,
  uploaded_count: number,
}

export enum LeaderboardLookupError {
  NotFound,
  ServerError,
  FrontendError,
}

export type GetLeaderboardResponse = Leaderboard | LeaderboardLookupError;

export function GetLeaderboardIsOk(response: GetLeaderboardResponse): response is Leaderboard {
  return response.hasOwnProperty('tts_leaderboard');
}

export function GetLeaderboardIsErr(response: GetLeaderboardResponse): response is LeaderboardLookupError {
  return !response.hasOwnProperty('tts_leaderboard');
}

interface LeaderboardResponsePayload {
  success: boolean,
  error_reason?: string,
  tts_leaderboard?: Leaderboard,
  w2l_leaderboard?: Leaderboard,
}


export async function GetLeaderboard() : Promise<GetLeaderboardResponse> 
{
  const endpoint = new ApiConfig().getLeaderboard();
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : LeaderboardResponsePayload = res;

    if (response?.success) {
      return res as Leaderboard; // TODO: This is not the way.
    } 

    if (response?.success === false) {
      if (response.error_reason?.includes("not found")) {
        return LeaderboardLookupError.NotFound;
      } else {
        return LeaderboardLookupError.ServerError;
      }
    }

    return LeaderboardLookupError.FrontendError;
  })
  .catch(e => {
    return LeaderboardLookupError.FrontendError;
  });
}
