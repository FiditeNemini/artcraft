import { signal } from "@preact/signals-core";
import { AudioMediaItem } from "~/pages/PageEnigma/models";

export const audioItemsFromServer = signal<AudioMediaItem[]>([]);
export const isRetreivingAudioItems = signal<boolean>(false);

export const cancelNewFromAudioItem = (mediaId:string)=>{
  const newList = audioItemsFromServer.value.map((item)=>{
    if( item.media_id === mediaId ) item.isNew = false;
    return item;
  })
  audioItemsFromServer.value = [...newList];
}

export const updateAudioItemLength = (mediaId:string, duration: number)=>{
  const newList = audioItemsFromServer.value.map((item)=>{
    if( item.media_id === mediaId ) item.length = duration;
    return item;
  })
  audioItemsFromServer.value = [...newList];
}