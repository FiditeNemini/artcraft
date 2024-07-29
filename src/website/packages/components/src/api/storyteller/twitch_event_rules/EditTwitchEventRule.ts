import { ApiConfig } from "../../ApiConfig";
import { EventMatchPredicate } from "./shared/EventMatchPredicate";
import { EventResponse } from "./shared/EventResponse";


export interface EditTwitchEventRuleRequest {
  event_match_predicate: EventMatchPredicate,
  event_response: EventResponse,
  rule_is_disabled: boolean,
}

export interface EditTwitchEventRuleSuccessResponse {
  success: boolean,
}

export interface EditTwitchEventRuleErrorResponse {
  success: boolean,
}

type EditTwitchEventRuleResponse = EditTwitchEventRuleSuccessResponse | EditTwitchEventRuleErrorResponse;

export function EditTwitchEventRuleIsOk(response: EditTwitchEventRuleResponse): response is EditTwitchEventRuleSuccessResponse {
  return response?.success === true;
}

export function EditTwitchEventRuleIsError(response: EditTwitchEventRuleResponse): response is EditTwitchEventRuleErrorResponse {
  return response?.success === false;
}

export async function EditTwitchEventRule(ruleToken: string, request: EditTwitchEventRuleRequest) : Promise<EditTwitchEventRuleResponse> 
{
  const endpoint = new ApiConfig().editTwitchEventRule(ruleToken);
  
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
