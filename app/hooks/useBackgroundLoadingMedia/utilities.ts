import { FilterMediaClasses, ToastTypes } from "~/enums";

import { MediaFilesApi } from "~/Classes/ApiManager/MediaFilesApi";

import {
  addToast,
  authentication,
  setUserAudioItems,
  setUserMovies,
  isRetreivingAudioItems,
  isRetreivingUserMovies,
} from "~/signals";
const { userInfo } = authentication;

export async function PollUserMovies() {
  if (!userInfo.value || isRetreivingUserMovies.value) {
    //do nothing return if login info does not exist
    return;
  }

  isRetreivingUserMovies.value = true;
  const mediaFilesApi = new MediaFilesApi();
  const response = await mediaFilesApi.ListUserMediaFiles({
    filter_media_classes: [FilterMediaClasses.VIDEO],
  });
  isRetreivingUserMovies.value = false;
  if (response.success && response.data) {
    setUserMovies(response.data);
    addToast(
      ToastTypes.SUCCESS,
      "New movie is completed! Please check My Movies",
      false,
    );
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
    page_size: 100,
    filter_media_classes: [FilterMediaClasses.AUDIO],
  });
  isRetreivingAudioItems.value = false;
  if (response.success && response.data) {
    setUserAudioItems(response.data);
    addToast(
      ToastTypes.SUCCESS,
      "New audio is generated! Please check your audio library",
      false,
    );
    return;
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage || "Unknown Error in Loading My Audio Items",
  );
}
