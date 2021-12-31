import { ApiConfig } from "../../../common/ApiConfig";

export interface ListTtsCategoriesForModerationSuccessResponse {
  success: boolean,
  categories: Array<ModerationTtsCategory>
}

export interface ModerationTtsCategory {
  category_token: string,
  model_type: string,
  maybe_super_category_token?: string,

  can_directly_have_models: boolean,
  can_have_subcategories: boolean,
  can_only_mods_apply: boolean,

  name: string,
  maybe_dropdown_name?: string,

  creator_user_token?: string,
  creator_username?: string,
  creator_display_name?: string,
  creator_gravatar_hash?: string,

  is_mod_approved?: boolean,
  maybe_mod_comments?: string,

  created_at: Date,
  updated_at: Date,
  deleted_at?: Date,
}

export interface ListTtsCategoriesForModerationErrorResponse {
  success: boolean,
}

type ListTtsCategoriesForModerationResponse = ListTtsCategoriesForModerationSuccessResponse | ListTtsCategoriesForModerationErrorResponse;

export function ListTtsCategoriesForModerationIsOk(response: ListTtsCategoriesForModerationResponse): response is ListTtsCategoriesForModerationSuccessResponse {
  return response?.success === true;
}

export function ListTtsCategoriesForModerationIsError(response: ListTtsCategoriesForModerationResponse): response is ListTtsCategoriesForModerationErrorResponse {
  return response?.success === false;
}

export async function ListTtsCategoriesForModeration() : Promise<ListTtsCategoriesForModerationResponse> 
{
  const endpoint = new ApiConfig().getModerationTtsCategoryList();
  
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
