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
