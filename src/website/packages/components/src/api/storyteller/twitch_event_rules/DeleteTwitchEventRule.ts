import { ApiConfig } from "../../ApiConfig";

export interface DeleteTwitchEventRuleResponse {
  success: boolean,
}

export async function DeleteTwitchEventRule(ruleToken: string) : Promise<DeleteTwitchEventRuleResponse> 
{
  const endpoint = new ApiConfig().deleteTwitchEventRule(ruleToken);
  
  return await fetch(endpoint, {
    method: 'DELETE',
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
