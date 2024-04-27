import { signal } from "@preact/signals-core";
import { AudioMediaItem } from "~/pages/PageEnigma/models";
export const audioItemsFromServer = signal<AudioMediaItem[]>([]);

export const cancelNewFromAudioItem = (mediaId:string)=>{
  console.log('function called');
  const newList = audioItemsFromServer.value.map((item)=>{
    if( item.media_id === mediaId ) item.isNew = false;
    return item;
  })
  console.log(newList);
  audioItemsFromServer.value = [...newList];
}