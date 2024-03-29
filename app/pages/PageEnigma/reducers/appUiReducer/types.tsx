import { XYZ } from "../../datastructures/common";
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
    message?:string;
  };
  showEditorLoadingBar:{
    isShowing: boolean;
    label?: string;
    message?: string;
    progress?: number;
    useFakeTimer?: number;
  }
  currentSceneObject:{
    isShowing: boolean;
    objectVectors: {
      position:XYZ;
      rotation:XYZ;
      scalar: XYZ;
    };
  }
};


export enum ACTION_TYPES {
  ON_TIMELINE_RESIZE = "on_timeline_resize",
  ON_CHANGE_VIEW_MODE = "on_change_view_mode",
  SHOW_EDITOR_LOADER = "show_editor_loader",
  HIDE_EDITOR_LOADER = "hide_editor_loader",
  SHOW_EDITOR_LOADINGBAR = "show_editor_loadingbar",
  UPDATE_EDITOR_LOADINGBAR = "update_editor_loadingbar",
  HIDE_EDITOR_LOADINGBAR = "hide_editor_loadingbar",
  SHOW_CONTROLPANELS_SCENEOBJECT = "show_controlpanels_sceneobject",
  HIDE_CONTROLPANELS_SCENEOBJECT = "hide_controlpanels_sceneobject",
};

export type Action =
  | {type: ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT}
  | {
      type: ACTION_TYPES.SHOW_CONTROLPANELS_SCENEOBJECT,
      payload:{
        currentSceneObject: {
          objectVectors: {
            position:XYZ;
            rotation:XYZ;
            scalar: XYZ;
          };
        };
      }
    }
  | {type: ACTION_TYPES.HIDE_EDITOR_LOADER,}
  | {
      type: ACTION_TYPES.SHOW_EDITOR_LOADER,
      payload?:{
        showEditorLoader: {
          message:string|undefined;
        }
      }
    }
  | {type: ACTION_TYPES.HIDE_EDITOR_LOADINGBAR,}
  | {
      type: ACTION_TYPES.SHOW_EDITOR_LOADINGBAR,
      payload?:{
        showEditorLoadingBar: {
          label?: string;
          message?: string;
          progress?: number;
          useFakeTimer?: number;
        }
      }
    }
  | {
      type: ACTION_TYPES.UPDATE_EDITOR_LOADINGBAR,
      payload:{
        showEditorLoadingBar: {
          label?: string;
          message?: string;
          progress?: number;
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