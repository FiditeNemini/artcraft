import { ApiConfig } from "../../ApiConfig";

export interface RuleTokenPositionPair {
  rule_token: string,
  position: number,
}

export interface ReorderTwitchEventRulesRequest {
  rule_token_position_pairs: RuleTokenPositionPair[],
}

export interface ReorderTwitchEventRulesSuccessResponse {
  success: boolean,
}

export interface ReorderTwitchEventRulesErrorResponse {
  success: boolean,
}

type ReorderTwitchEventRulesResponse = ReorderTwitchEventRulesSuccessResponse | ReorderTwitchEventRulesErrorResponse;

export function ReorderTwitchEventRulesIsOk(response: ReorderTwitchEventRulesResponse): response is ReorderTwitchEventRulesSuccessResponse {
  return response?.success === true;
}

export function ReorderTwitchEventRulesIsError(response: ReorderTwitchEventRulesResponse): response is ReorderTwitchEventRulesErrorResponse {
  return response?.success === false;
}

export async function ReorderTwitchEventRules(request: ReorderTwitchEventRulesRequest) : Promise<ReorderTwitchEventRulesResponse> 
{
  const endpoint = new ApiConfig().reorderTwitchEventRules();
  
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  })
  .then(res => res.json())
  .then(res => {
    if (!res) {
      return { success : false }; // TODO: This loses error semantics and is deprecated
    }

    if (res && 'success' in res) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}
