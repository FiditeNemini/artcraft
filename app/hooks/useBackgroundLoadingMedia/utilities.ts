import { MediaFileType } from "~/pages/PageEnigma/enums";

import { ToastTypes } from "~/enums";

import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";

import {
  addToast,
  authentication,
  setUserAudioItems,
  setUserMovies,
  userMovies,
} from "~/signals";
const { userInfo } = authentication;

export function PollUserMovies() {
  if (!userInfo.value) {
    //do nothing return if login info does not exist
    return;
  }
  return GetMediaByUser(
    userInfo.value.username,
    {},
    {
      filter_media_type: MediaFileType.Video,
    },
  )
    .then((res: GetMediaListResponse) => {
      if (userMovies.value && res.results.length !== userMovies.value.length) {
        setUserMovies(res.results);
      }
    })
    .catch(() => {
      addToast(ToastTypes.ERROR, "Unknown Error in Loading My Movies");
    });
}

export function PollUserAudioItems() {
  if (!userInfo.value) {
    //do nothing return if login info does not exist
    return;
  }
  return GetMediaByUser(
    userInfo.value.username,
    {},
    {
      filter_media_type: MediaFileType.Audio,
    },
  )
    .then((res: GetMediaListResponse) => {
      setUserAudioItems(res.results);
    })
    .catch(() => {
      addToast(ToastTypes.ERROR, "Unknown Error in Loading My Audio Items");
    });
}
