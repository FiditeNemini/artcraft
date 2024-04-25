import { signal } from "@preact/signals-core";
import { AssetType, Clip, Keyframe } from "~/pages/PageEnigma/models";

export const selectedItem = signal<Clip | Keyframe | null>(null);

export const selectedObject = signal<{ type: AssetType; id: string } | null>(
  null,
);
