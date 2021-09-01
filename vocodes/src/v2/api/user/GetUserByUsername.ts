import { ApiConfig } from "../../../common/ApiConfig";

interface ProfileResponsePayload {
  success: boolean,
  error_reason?: string,
  user?: User,
}

export interface User {
  user_token: string,
  username: string,
  display_name: string,
  email_gravatar_hash: string,
  profile_markdown: string,
  profile_rendered_html: string,
  user_role_slug: string,
  banned: boolean,
  dark_mode: string,
  avatar_public_bucket_hash: string,
  disable_gravatar: boolean,
  hide_results_preference: boolean,
  website_url: string | undefined | null,
  discord_username: string | undefined | null,
  twitch_username: string | undefined | null,
  twitter_username: string | undefined | null,
  github_username: string | undefined | null,
  //patreon_username?: string,
  cashapp_username: string | undefined | null,
  created_at: string,
  badges: ProfileBadge[],
}

export interface ProfileBadge {
  slug: string,
  title: string,
  description: string,
  image_url: string,
  granted_at: string,
}

export async function GetUserByUsername(username: string) : Promise<User | undefined> {
  const usernameLower = username.toLowerCase(); // NB: Until I standardize on display name vs username lookup.
  const endpoint = new ApiConfig().getProfile(usernameLower);
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : ProfileResponsePayload = res;
    if (!response.success) {
      return;
    }
    return response?.user;
  })
  .catch(e => {
    return undefined;
  });
}
