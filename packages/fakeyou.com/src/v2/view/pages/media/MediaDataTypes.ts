export enum MediaType {
  Audio = "audio",
  Video = "video",
  Image = "image",
}

export default interface MediaData {
  token: string;
  media_type: MediaType;
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
  audio_text: string;
  model_used: string;
  model_link: string;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
}
