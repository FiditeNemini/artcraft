import { signal } from "@preact/signals-core";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
export const audioItemsFromServer = signal<MediaItem[]>([]);