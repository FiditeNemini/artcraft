import { ApiConfig } from "../../../common/ApiConfig";

interface W2lTemplateViewResponsePayload {
  success: boolean,
  template: W2lTemplate,
}

export interface W2lTemplate {
  template_token: string,
  template_type: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  updatable_slug: string,
  title: string,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  maybe_image_object_name: string,
  maybe_video_object_name: string,
  creator_set_visibility: string,
  is_public_listing_approved: boolean | null,
  created_at: string,
  updated_at: string,
  maybe_moderator_fields: W2lTemplateModeratorFields | null | undefined,
}

export interface W2lTemplateModeratorFields {
  creator_ip_address_creation: string,
  creator_ip_address_last_update: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

export async function GetW2lTemplate(templateToken: string) : Promise<W2lTemplate | undefined> {
    const endpoint = new ApiConfig().viewW2lTemplate(templateToken);

    return await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lTemplateViewResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }
      return templatesResponse?.template;
    })
    .catch(e => {
      return undefined;
    });
}
