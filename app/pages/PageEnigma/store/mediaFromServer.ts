import { signal } from "@preact/signals-core";
import { AudioMediaItem } from "~/pages/PageEnigma/models";
export const audioItemsFromServer = signal<AudioMediaItem[]>([]);