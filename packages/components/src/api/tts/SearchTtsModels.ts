import { ApiConfig } from "../ApiConfig";

export interface SearchTtsModelsRequest {
  search_term: string;
}

export interface SearchTtsModelsResponse {
  success: boolean;
  models: TtsModel[];
}

export interface TtsModel {
  model_token: string,
  title: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  ietf_language_tag: string,
  ietf_primary_language_subtag: string,
  creator_set_visibility: string,
  created_at: string,
  updated_at: string,
}

export enum SearchTtsModelsError {
  NotFound,
  ServerError,
  FrontendError,
}

export async function SearchTtsModels(request: SearchTtsModelsRequest) : Promise<SearchTtsModelsResponse> {
  const endpoint = new ApiConfig().searchTts();
  
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
      return { success : false };
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
