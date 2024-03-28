import { signal } from "@preact/signals-core";

export const dragType = signal<"animations" | "lipSync" | null>(null);
export const dragId = signal<string | null>(null);
export const canDrop = signal(false);
export const overTimeline = signal(false);
export const dropId = signal("");
export const dropOffset = signal(0);
