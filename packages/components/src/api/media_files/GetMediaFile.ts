import { ApiConfig } from "../ApiConfig";
import { UserDetailsLight } from "../_common/UserDetailsLight";
import { MediaFileType } from "../_common/enums/MediaFileType";

export interface MediaFile {
  token: string,
  media_type: MediaFileType,
  public_bucket_path: string,
  maybe_creator_user: UserDetailsLight | null,
  creator_set_visibility: string,
  created_at: Date,
  updated_at: Date,
}

export enum MediaFileLookupError {
  NotFound,
  ServerError,
  FrontendError,
}

export interface GetMediaFileResponse {
  success: boolean,
  media_file?: MediaFile,
}

export async function GetMediaFile(mediaFileToken: string) : Promise<GetMediaFileResponse> {
  const endpoint = new ApiConfig().getMediaFile(mediaFileToken);
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : GetMediaFileResponse = res;

    if (response && response.success && response.media_file) {
      // NB: Timestamps aren't converted to Date objects on their own!
      response.media_file.created_at  = new Date(response.media_file.created_at);
      response.media_file.updated_at  = new Date(response.media_file.updated_at);
      return response;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}
