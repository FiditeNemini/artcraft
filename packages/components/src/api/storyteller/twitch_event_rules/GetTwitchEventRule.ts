import { ApiConfig } from "../../ApiConfig";
import { EventMatchPredicate } from "./shared/EventMatchPredicate";
import { EventResponse } from "./shared/EventResponse";
import { TwitchEventCategory } from "./shared/TwitchEventCategory";

export interface GetTwitchEventRuleSuccessResponse {
  success: boolean,
  twitch_event_rule: TwitchEventRule
}

export interface TwitchEventRule {
  token: string,
  event_category: TwitchEventCategory,
  event_match_predicate: EventMatchPredicate,
  event_response: EventResponse,
  user_specified_rule_order: number,
  rule_is_disabled: boolean,
  created_at: Date,
  updated_at: Date,
}

export interface GetTwitchEventRuleErrorResponse {
  success: boolean,
}

type GetTwitchEventRuleResponse = GetTwitchEventRuleSuccessResponse | GetTwitchEventRuleErrorResponse;

export function GetTwitchEventRuleIsOk(response: GetTwitchEventRuleResponse): response is GetTwitchEventRuleSuccessResponse {
  return response?.success === true;
}

export function GetTwitchEventRuleIsError(response: GetTwitchEventRuleResponse): response is GetTwitchEventRuleErrorResponse {
  return response?.success === false;
}

export async function GetTwitchEventRule(ruleToken: string) : Promise<GetTwitchEventRuleResponse> 
{
  const endpoint = new ApiConfig().getTwitchEventRule(ruleToken);
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
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
