import { MediaFileType } from "~/pages/PageEnigma/enums";

import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";

export function instanceOfMediaListResponse(
  object: GetMediaListResponse | { success: boolean; error_reason: string },
): object is GetMediaListResponse {
  return "results" in object;
}
export function GetUserMovies(username: string) {
  return GetMediaByUser(
    username,
    {},
    {
      filter_media_type: MediaFileType.Video,
    },
  )
    .then((res: GetMediaListResponse) => {
      return res;
    })
    .catch(() => {
      return {
        success: false,
        error_reason: "Unknown Error in Loading My Movies",
      };
    });
}
