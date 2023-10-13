export default interface MediaData {
  token: string;
  media_type: string;
  public_bucket_path: string;
  maybe_creator_user: {
    user_token: string;
    username: string;
    display_name: string;
    gravatar_hash: string;
    default_avatar: {
      image_index: number;
      color_index: number;
    };
  };
  creator_set_visibility: string;
  created_at: string;
  updated_at: string;
}
