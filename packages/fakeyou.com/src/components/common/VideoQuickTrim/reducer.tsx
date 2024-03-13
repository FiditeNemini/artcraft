import {
  MIN_VID_DURATION,
  TIME_CURSOR_WIDTH,
  TRIM_OPTIONS,
  roundToMilliseconds
} from "./utilities";

export enum STATE_STATUSES {
  INIT = "init",
  VIDEO_METADATA_LOADED = "video_metadata_loaded",
  LOAD_ORDER_ERROR = "load_order_error",
  ACTION_TYPE_ERROR = "no_such_action_type"
};

export enum PLAYPUASE_STATES{
  NOT_READY = "not_ready",
  READY = "ready",
  PLAYING = "playing",
  PAUSED = "paused",
  ENDED = "ended",
}

export type State = {
  status: string;
  errorMessage: string[];

  playpause: string;

  canNotTrim: boolean | undefined;
  trimDuration: number | undefined;
  trimStartSeconds: number | undefined;
  trimEndSeconds: number | undefined;
  videoLoadProgress: TimeRanges | undefined;
  videoDuration: number | undefined;

  playbarWidth: number | undefined;
  scrubberWidth: number | undefined;

  isMuted: boolean;
  isRepeatOn: boolean;
};

export const initialState = {
  status: STATE_STATUSES.INIT,
  errorMessage : [],
  playpause: PLAYPUASE_STATES.NOT_READY,
  canNotTrim: undefined,
  trimDuration: undefined,
  trimStartSeconds: undefined,
  trimEndSeconds: undefined,
  videoLoadProgress: undefined,
  videoDuration: undefined,
  playbarWidth: undefined,
  scrubberWidth: undefined,
  timeCursorOffset: undefined,
  isMuted: false,
  isRepeatOn: true,
}

export enum ACTION_TYPES {
  RESET = "reset",
  TOGGLE_REPEAT = "toggle_repeat",
  TOGGLE_MUTE = "toggle_mute",
  ON_LOADED_METADATA = "on_loaded_metadata",
  MOVE_TIMECURSOR = "move_timecursor",
  SET_PLAYPUASE = "set_playpause",
  SET_PLAYBAR_LAYOUT = "set_playbar_layout",
  SET_TRIM_DURATION = "set_trim_duration",
  SET_VIDEO_LOAD_PROGRESS = "set_video_load_progress",
  MOVE_TRIM = "move_trim"
}

export type Action = 
  | {type: ACTION_TYPES.RESET}
  | {type: ACTION_TYPES.TOGGLE_REPEAT, payload?:{isRepeatOn: boolean}}
  | {type: ACTION_TYPES.TOGGLE_MUTE}
  | {type: ACTION_TYPES.ON_LOADED_METADATA, payload: {videoDuration: number}}
  | {type: ACTION_TYPES.MOVE_TIMECURSOR, payload:{ timeCursorOffset: number}}
  | {type: ACTION_TYPES.SET_PLAYPUASE, payload:{ playpause: string}}
  | {type: ACTION_TYPES.SET_PLAYBAR_LAYOUT, payload:{ playbarWidth: number}}
  | {type: ACTION_TYPES.SET_TRIM_DURATION, payload:{ trimDurationString: string}}
  | {type: ACTION_TYPES.SET_VIDEO_LOAD_PROGRESS, payload: {
      videoLoadProgress: TimeRanges
    }}
  | {type: ACTION_TYPES.MOVE_TRIM, payload:{
    trimStartSeconds: number,
    trimEndSeconds: number,
  }}
;

export function reducer(state: State, action: Action): State {
  console.log("VideoQuickTrim State Dispatch");
  console.log(action);

  switch(action.type){
    case ACTION_TYPES.SET_PLAYPUASE:{
      return {...state, ...action.payload};
    }
    case ACTION_TYPES.TOGGLE_REPEAT:{
      if(action.payload){
        return {...state, isRepeatOn: action.payload.isRepeatOn}
      }
      return {...state, isRepeatOn: !state.isRepeatOn}
    }
    case ACTION_TYPES.TOGGLE_MUTE:{
      return {...state, isMuted: !state.isMuted}
    }
    case ACTION_TYPES.ON_LOADED_METADATA:{
      if(action.payload.videoDuration >= MIN_VID_DURATION){
        return{
          ...state,
          status: STATE_STATUSES.VIDEO_METADATA_LOADED,
          videoDuration: action.payload.videoDuration,
          canNotTrim: false,
          trimDuration: 3,
          trimStartSeconds: 0,
          trimEndSeconds: 3,
        }
      }else{
        return {
          ...state,
          videoDuration: action.payload.videoDuration,
          canNotTrim: true
        }
      }
    }
    case ACTION_TYPES.SET_VIDEO_LOAD_PROGRESS:{
      return{
        ...state,
        videoLoadProgress: action.payload.videoLoadProgress
      };
    }
    case ACTION_TYPES.SET_PLAYBAR_LAYOUT:{
      const newWidth = action.payload.playbarWidth;
      // const prevOffset = state.timeCursorOffset || 0;
      if(state.trimDuration && state.videoDuration){
        return {
          ...state,
          playpause: PLAYPUASE_STATES.READY,
          playbarWidth: newWidth,
          scrubberWidth: newWidth * (state.trimDuration / state.videoDuration),
          // timeCursorOffset: (newWidth-TIME_CURSOR_WIDTH)*(prevOffset/ state.videoDuration)
        };
      }else{
        return{
          ...state,
          status: STATE_STATUSES.LOAD_ORDER_ERROR,
          errorMessage: [...state.errorMessage, 'Setting playbar layout before video and trim are loaded']
        }
      }
    }
    case ACTION_TYPES.SET_TRIM_DURATION:{
      const selected = action.payload.trimDurationString;
      if( state.canNotTrim !== undefined 
        && state.canNotTrim === false 
        && state.playbarWidth !==undefined
        && state.videoDuration !== undefined
        && TRIM_OPTIONS[selected] <= state.videoDuration
        && state.trimStartSeconds !== undefined 
      ){
        let newTrimStart = state.trimStartSeconds;
        let newTrimEnd = state.trimStartSeconds + TRIM_OPTIONS[selected];
        if (newTrimEnd > state.videoDuration){
          newTrimEnd = state.videoDuration;
          if (state.videoDuration - TRIM_OPTIONS[selected] >=0) {
            newTrimStart = roundToMilliseconds(state.videoDuration - TRIM_OPTIONS[selected]);
          }else{
            newTrimStart = 0;
          }
        }
        return{
          ...state,
          trimDuration: newTrimEnd-newTrimStart,
          trimStartSeconds: newTrimStart,
          trimEndSeconds: newTrimEnd,
          scrubberWidth: (newTrimEnd-newTrimStart)/state.videoDuration * state.playbarWidth,
        }
      }else{
        return {
          ...state,
          status: STATE_STATUSES.LOAD_ORDER_ERROR,
          errorMessage: [...state.errorMessage, 'Setting trim duration before video and trim are loaded']
        }
      }
    }
    case ACTION_TYPES.MOVE_TRIM:{
      return{
        ...state,
        trimStartSeconds: roundToMilliseconds(action.payload.trimStartSeconds),
        trimEndSeconds: roundToMilliseconds(action.payload.trimEndSeconds),
      }
    }
    // case ACTION_TYPES.MOVE_TIMECURSOR:{
    //   return {
    //     ...state,
    //     timeCursorOffset: action.payload.timeCursorOffset
    //   }
    // }
    case ACTION_TYPES.RESET:{
      return initialState
    }
    default:{
      return {
        ...state,
        status: STATE_STATUSES.ACTION_TYPE_ERROR,
        errorMessage: [...state.errorMessage, "Reducer Action switch's default case is reached"]
      }
    }
  }
};

/*
  const trimScrubberWidth = videoRef.current && playbarWidth > 0
    ? trimDuration > 0 && trimDuration < videoRef.current.duration 
      ? (trimDuration / videoRef.current.duration * playbarWidth) 
      : playbarWidth
    : 0;
*/

