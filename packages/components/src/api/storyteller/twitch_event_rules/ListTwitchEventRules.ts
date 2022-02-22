import { ApiConfig } from "../../ApiConfig";
import { EventMatchPredicate } from "./shared/EventMatchPredicate";
import { EventResponse } from "./shared/EventResponse";
import { TwitchEventCategory } from "./shared/TwitchEventCategory";

export interface ListTwitchEventRulesSuccessResponse {
  success: boolean,
  twitch_event_rules: Array<TwitchEventRule>
}

export interface TwitchEventRule{
  token: string,
  event_category: TwitchEventCategory,
  event_match_predicate: EventMatchPredicate,
  event_response: EventResponse,
  user_specified_rule_order: number,
  rule_is_disabled: boolean,
  created_at: Date,
  updated_at: Date,
}

export interface ListTwitchEventRulesErrorResponse {
  success: boolean,
}

type ListTwitchEventRulesResponse = ListTwitchEventRulesSuccessResponse | ListTwitchEventRulesErrorResponse;

export function ListTwitchEventRulesIsOk(response: ListTwitchEventRulesResponse): response is ListTwitchEventRulesSuccessResponse {
  return response?.success === true;
}

export function ListTwitchEventRulesIsError(response: ListTwitchEventRulesResponse): response is ListTwitchEventRulesErrorResponse {
  return response?.success === false;
}

export async function ListTwitchEventRules() : Promise<ListTwitchEventRulesResponse> 
{
  const endpoint = new ApiConfig().listTwitchEventRules();
  
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
