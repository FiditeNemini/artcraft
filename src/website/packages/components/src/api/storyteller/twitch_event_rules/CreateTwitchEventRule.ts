import { ApiConfig } from "../../ApiConfig";
import { EventMatchPredicate } from "./shared/EventMatchPredicate";
import { EventResponse } from "./shared/EventResponse";
import { TwitchEventCategory } from "./shared/TwitchEventCategory";


export interface CreateTwitchEventRuleRequest {
  idempotency_token: string,
  event_category: TwitchEventCategory,

  event_match_predicate: EventMatchPredicate,
  event_response: EventResponse,
  rule_is_disabled: boolean,

  user_specified_rule_order: number,
}

export interface CreateTwitchEventRuleSuccessResponse {
  success: boolean,
}

export interface CreateTwitchEventRuleErrorResponse {
  success: boolean,
}

type CreateTwitchEventRuleResponse = CreateTwitchEventRuleSuccessResponse | CreateTwitchEventRuleErrorResponse;

export function CreateTwitchEventRuleIsOk(response: CreateTwitchEventRuleResponse): response is CreateTwitchEventRuleSuccessResponse {
  return response?.success === true;
}

export function CreateTwitchEventRuleIsError(response: CreateTwitchEventRuleResponse): response is CreateTwitchEventRuleErrorResponse {
  return response?.success === false;
}

export async function CreateTwitchEventRule(request: CreateTwitchEventRuleRequest) : Promise<CreateTwitchEventRuleResponse> 
{
  const endpoint = new ApiConfig().createTwitchEventRule();
  
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
