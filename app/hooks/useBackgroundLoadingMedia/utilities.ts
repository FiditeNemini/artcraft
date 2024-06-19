import { FilterMediaClasses, ToastTypes } from "~/enums";

import { MediaFilesApi } from "~/Classes/ApiManager/MediaFilesApi";

import {
  addToast,
  authentication,
  setUserAudioItems,
  setUserMovies,
  isRetreivingAudioItems,
} from "~/signals";
const { userInfo } = authentication;

export async function PollUserMovies() {
  if (!userInfo.value) {
    //do nothing return if login info does not exist
    return;
  }

  const mediaFilesApi = new MediaFilesApi();
  const response = await mediaFilesApi.ListUserMediaFiles({
    filter_media_classes: [FilterMediaClasses.VIDEO],
  });
  if (response.success && response.data) {
    setUserMovies(response.data);
    return;
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage || "Unknown Error in Loading My Movies",
  );
}

export async function PollUserAudioItems() {
  if (!userInfo.value) {
    //do nothing return if login info does not exist
    return;
  }
  isRetreivingAudioItems.value = true;
  const mediaFilesApi = new MediaFilesApi();
  const response = await mediaFilesApi.ListUserMediaFiles({
    filter_media_classes: [FilterMediaClasses.AUDIO],
  });
  isRetreivingAudioItems.value = false;
  if (response.success && response.data) {
    setUserAudioItems(response.data);
    return;
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage || "Unknown Error in Loading My Audio Items",
  );
}
