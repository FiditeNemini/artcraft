import { signal } from "@preact/signals-core";
import { MediaItem } from "~/pages/PageEnigma/models";
export const audioItemsFromServer = signal<MediaItem[]>([]);