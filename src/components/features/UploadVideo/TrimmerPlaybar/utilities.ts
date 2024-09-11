export const buttonStyles = "border border-ui-border bg-ui-panel cursor-grab";
export const verticalPositionStyles = "absolute top-1/2 -translate-y-1/2";
export const MAX_TRIM_DURATION = 6000;
export enum MouseState {
  IDLE = "idle",
  DRAGGING = "dragging",
}
export type TrimData = {
  trimStartMs: number;
  trimEndMs: number;
};

export function formatSecondsToHHMMSSCS(seconds: number) {
  //example of the ISO String: 1970-01-01T00:01:40.774Z
  const isoString = new Date(seconds * 1000).toISOString();
  if (seconds > 3600)
    return isoString.substring(11, 19) + "." + isoString.substring(20, 22);
  else return isoString.substring(14, 19) + "." + isoString.substring(20, 22);
}
