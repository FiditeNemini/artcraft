//For integration into other components 
export type QuickTrimData = {
  trimStartSeconds: number;
  trimEndSeconds: number;
}

// INTERNALS
export type TrimStates = {
  canNotTrim: boolean;
  isScrubbingTrim: boolean;
  trimDuration: number;
  trimStart: number;
  trimEnd: number;
  maxDuration: number;
}

export type PlaybarStates = {
  playbarWidth: number;
  timeCursorOffset: number;
}
