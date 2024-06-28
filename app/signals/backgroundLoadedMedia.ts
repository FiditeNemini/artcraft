import { signal } from "@preact/signals-core";
import { AssetType } from "~/enums";
import { MediaInfo } from "~/pages/PageEnigma/models/movies";
import { AudioMediaItem } from "~/pages/PageEnigma/models";
import deepEqual from "deep-equal";

// Signal for background loading User's Movies
export const userMovies = signal<MediaInfo[] | undefined>(undefined);
export const isRetreivingUserMovies = signal<boolean>(false);

export const setUserMovies = (newSet: MediaInfo[]) => {
  if (!deepEqual(userMovies.value, newSet)) {
    console.log("set movies");
    userMovies.value = newSet;
  }
  //else do nothing cos it's the same list;
};

//Signal for background loading User's Audio Items.
export const userAudioItems = signal<AudioMediaItem[] | undefined>(undefined);
export const setUserAudioItems = (newSet: MediaInfo[]) => {
  const previousItems = userAudioItems.value ? [...userAudioItems.value] : [];
  const morphedNewSet = newSet.map((item) => {
    const morphedItem: AudioMediaItem = {
      version: 1,
      type: AssetType.AUDIO,
      category: getCategory(item),
      media_id: item.token,
      object_uuid: item.token,
      name: getTitle(item),
      description: item.maybe_text_transcript || "",
      publicBucketPath: item.public_bucket_path,
      length: getLength(item),
      thumbnail: "/resources/placeholders/audio_placeholder.png",
      isMine: true,
      isNew:
        previousItems.length > 0
          ? checkIsNew(previousItems, item.token)
          : false,
      // isBookmarked?: boolean;
    };
    return morphedItem;
  });
  userAudioItems.value = morphedNewSet;
};

export const isRetreivingAudioItems = signal<boolean>(false);

export const cancelNewFromAudioItem = (mediaId: string) => {
  if (!userAudioItems.value || userAudioItems.value.length === 0) {
    return;
  }
  const newList = userAudioItems.value.map((item) => {
    if (item.media_id === mediaId) item.isNew = false;
    return item;
  });
  userAudioItems.value = [...newList];
};

export const updateAudioItemLength = (mediaId: string, duration: number) => {
  if (!userAudioItems.value || userAudioItems.value.length === 0) {
    return;
  }
  const newList = userAudioItems.value.map((item) => {
    if (item.media_id === mediaId) item.length = duration;
    return item;
  });
  userAudioItems.value = [...newList];
};

// Helper functions to massage Media Info to AudioMediaItem
// that's usable as a signal.
function getTitle(item: MediaInfo) {
  // console.log(item);
  if (item.maybe_title) return item.maybe_title;
  if (item.origin && item.origin.maybe_model && item.origin.maybe_model.title)
    return item.origin.maybe_model.title;
  return "Media Audio";
}
function getCategory(item: MediaInfo) {
  if (
    item.origin &&
    item.origin.product_category &&
    item.origin.product_category !== "unknown"
  )
    return item.origin.product_category;
  if (item.origin_category) return item.origin_category;
  return "unknown";
}
function checkIsNew(previousItems: AudioMediaItem[], token: string) {
  const foundItem = previousItems.find((item) => {
    return token === item.media_id && item.isNew !== true;
  });
  return foundItem === undefined;
}
function getLength(item: MediaInfo) {
  return item.maybe_duration_millis
    ? (item.maybe_duration_millis / 1000) * 60
    : undefined;
}
