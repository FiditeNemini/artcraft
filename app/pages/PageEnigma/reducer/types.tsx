export enum VIEW_MODES {
  EDITOR = 'editor',
  SIDE_BY_SIDE = 'side-by-side'
};

type ViewModes = VIEW_MODES.EDITOR | VIEW_MODES.SIDE_BY_SIDE;

export type State = {
  viewMode: ViewModes;
  timelineHeight: number;
  showEditorLoader: {
    isShowing:boolean;
    message:string|undefined;
  };
};


export enum ACTION_TYPES {
  ON_TIMELINE_RESIZE = "on_timeline_resize",
  ON_CHANGE_VIEW_MODE = "on_change_view_mode",
  SHOW_EDITOR_LOADER = "show_editor_loader",
  HIDE_EDITOR_LOADER = "hide_editor_loader",
};

export type Action = 
  | {type: ACTION_TYPES.HIDE_EDITOR_LOADER,}
  | {
      type: ACTION_TYPES.SHOW_EDITOR_LOADER,
      payload?:{
        showEditorLoader: {
          message:string|undefined;
        }
      }
    }
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
  }
  ;