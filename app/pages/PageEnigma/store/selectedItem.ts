import { signal } from "@preact/signals-core";
import { Clip, Keyframe } from "~/pages/PageEnigma/models";

export const selectedItem = signal<Clip | Keyframe | null>(null);

