import { GetMediaListResponse } from "~/pages/PageEnigma/models";
import { authentication, environmentVariables } from "~/signals";

const getMediaFilesByUsername = (username: string) =>
  `${environmentVariables.value.BASE_API}/v1/media_files/list/user/${username}?filter_media_type=scene_json`;

export const GetScenesByUser = () => {
  const unknownError = {
    success: false,
    error_reason: "Unknown error in Loading User Scenes",
  };
  if (!authentication.userInfo.value || !authentication.sessionToken.value) {
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
      session: authentication.sessionToken.value,
    },
  })
    .then((res) => res.json())
    .then((res: GetMediaListResponse) => {
      return res;
    })
    .catch(() => {
      return unknownError;
    });
};

// (
//       userInfo.value.username,
//       {},
//       {
//         filter_engine_categories: MediaFileType.Scene,
//       },
//     )
//       .then((res: GetMediaListResponse) => {
//         if (res.success && res.results) {
//           setScenes(updateScenes(res.results));
//           setIsSceneLoading(false);
//         }
//       })
//       .catch(() => {
//         return {
//           success: false,
//           error_reason: "Unknown error",
//         };
//       });
//     if (featuredStatus === FetchStatus.ready) {
//       featuredStatusSet(FetchStatus.in_progress);
//       ListFeaturedMediaFiles(
//         "",
//         {},
//         {
//           filter_engine_categories: "scene",
//           page_size: 100,
//         },
//       ).then((res: ListFeaturedMediaFilesResponse) => {
//         if (res.success && res.results) {
//           featuredStatusSet(FetchStatus.success);
//           featuredSet(updateScenes(res.results));
//         }
//       });
//     }
//   }, [featuredStatus, scenes, userInfo.value]);
