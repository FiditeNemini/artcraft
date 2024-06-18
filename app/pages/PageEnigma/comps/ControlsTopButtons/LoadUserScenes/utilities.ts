import { GetMediaListResponse } from "~/pages/PageEnigma/models";
import { authentication, environmentVariables } from "~/signals";

const getMediaFilesByUsername = (username: string) =>
  `${environmentVariables.value.BASE_API}/v1/media_files/list/user/${username}?filter_media_type=scene_json`;

export const GetScenesByUser = () => {
  const unknownError = {
    success: false,
    error_reason: "Unknown error in Loading User Scenes",
  };
  if (!authentication.userInfo.value) {
    return new Promise<typeof unknownError>((resolve) => {
      resolve(unknownError);
    });
  }

  const endpoint = getMediaFilesByUsername(
    authentication.userInfo.value.username,
  );

  return fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res: GetMediaListResponse) => {
      return res;
    })
    .catch(() => {
      return unknownError;
    });
};
