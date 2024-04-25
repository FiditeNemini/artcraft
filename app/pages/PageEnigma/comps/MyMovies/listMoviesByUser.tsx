import { listMediaByUser } from "~/api";
import { MediaInfo } from "~/pages/PageEnigma/models/movies";

export const listMoviesByUser = async (
  username: string,
): Promise<MediaInfo[]> => {
  return fetch(
    listMediaByUser(username) +
      "?" +
      new URLSearchParams({ filter_media_type: "video" }),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // credentials: 'include'
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success && res.results) {
        return res.results;
      }
      Promise.reject();
    })
    .catch(() => ({ success: false }));
};
