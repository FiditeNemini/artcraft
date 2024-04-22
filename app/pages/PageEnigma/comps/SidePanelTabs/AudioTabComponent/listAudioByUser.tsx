import { listMediaByUser } from "~/api";
import {
  MediaFileType,
  MediaFileClass,
  MediaFileSubtype,
  UserDetailsLight,
  WeightCategory,
  WeightType
} from "./types";


export interface MediaFile {
  token: string;
  media_type: MediaFileType;
  media_class: MediaFileClass | null;
  maybe_media_subtype: MediaFileSubtype | null;
  public_bucket_path: string;
  maybe_engine_extension: string | null;
  maybe_batch_token: string;
  maybe_title: string | null;
  maybe_original_filename: string | null;
  maybe_creator_user: UserDetailsLight | null;
  maybe_prompt_token: string | null;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  maybe_model_weight_info: {
    title: string;
    weight_token: string;
    weight_category: WeightCategory;
    weight_type: WeightType;
    maybe_weight_creator: UserDetailsLight;
    maybe_cover_image_public_bucket_path: string;
  };
}

export const ListAudioByUser = async(username:string, sessionToken: string) => {
  return await fetch(listMediaByUser(username),{
    method: 'GET',
    headers: {
      "Accept": "application/json",
      'session': sessionToken,
    },
    // credentials: 'include'
  })
  .then(res => res.json())
  .then(res => { 
    if(res.success && res.results){
      return res.results.filter((item:MediaFile)=>item['media_type']==='audio');
    }else{
      Promise.reject();
    }
  })
  .catch(e => ({ success : false }));
}

