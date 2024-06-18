import { ListFeaturedMediaFilesResponse } from "~/api/media_files/ListFeaturedMediaFiles";
import { environmentVariables } from "~/signals";

const listFeaturedScenes = () =>
  `${environmentVariables.value.BASE_API}/v1/media_files/list_featured?filter_media_type=scene_json`;

export const ListFeaturedScenes = () => {
  const unknownError = {
    success: false,
    error_reason: "Unknown error in Loading Featured Scenes",
  };
  const endpoint = listFeaturedScenes();

  return fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res: ListFeaturedMediaFilesResponse) => {
      return res;
    })
    .catch(() => {
      return unknownError;
    });
};
