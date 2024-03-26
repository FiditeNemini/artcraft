export enum VIEW_MODES {
  EDITOR = 'editor',
  SIDE_BY_SIDE = 'side-by-side'
};

type ViewModes = VIEW_MODES.EDITOR | VIEW_MODES.SIDE_BY_SIDE;

export type State = {
  viewMode: ViewModes;
  timelineHeight: number
};


export enum ACTION_TYPES {
  ON_TIMELINE_RESIZE = "on_timeline_resize",
  ON_CHANGE_VIEW_MODE = "on_change_view_mode"
};

export type Action = 
  | {
      type: ACTION_TYPES.ON_TIMELINE_RESIZE, 
      payload: {
        timelineHeight: number
      }
    }
  | {
    type: ACTION_TYPES.ON_CHANGE_VIEW_MODE, 
    payload: {
      viewMode: ViewModes
    }
  };