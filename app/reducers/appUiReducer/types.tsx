import { Simple3DVector } from "../../pages/PageEnigma/datastructures/common";
import { AssetType, ClipGroup } from "../../pages/PageEnigma/models";
export enum VIEW_MODES {
  EDITOR = "editor",
  SIDE_BY_SIDE = "side-by-side",
}

type ViewModes = VIEW_MODES.EDITOR | VIEW_MODES.SIDE_BY_SIDE;

export type ControlPanel = {
  isShowing: boolean;
  currentSceneObject: SceneObject;
};
export type SceneObject = {
  group: ClipGroup; // TODO: add meta data to determine what it is a camera or a object or a character into prefab clips
  object_uuid: string;
  object_name: string;
  version: string;
  objectVectors: Simple3DVector;
};

export type State = {
  viewMode: ViewModes;
  timelineHeight: number;
  showEditorLoader: {
    isShowing: boolean;
    message?: string;
  };
  controlPanel: ControlPanel;
  diagloueTts: {
    isOpen: boolean;
  };
};

export enum ACTION_TYPES {
  ON_TIMELINE_RESIZE = "on_timeline_resize",
  ON_CHANGE_VIEW_MODE = "on_change_view_mode",
  SHOW_EDITOR_LOADER = "show_editor_loader",
  HIDE_EDITOR_LOADER = "hide_editor_loader",
  SHOW_CONTROLPANELS_SCENEOBJECT = "show_controlpanels_sceneobject",
  UPDATE_CONTROLPANELS_SCENEOBJECT = "update_controlpanels_sceneobject",
  HIDE_CONTROLPANELS_SCENEOBJECT = "hide_controlpanels_sceneobject",
  OPEN_DIALOGUE_TTS = "open_dialogue_tts",
  CLOSE_DIALOGUE_TTS = "close_dialogue_tts",
}

export type Action =
  | { type: ACTION_TYPES.OPEN_DIALOGUE_TTS }
  | { type: ACTION_TYPES.CLOSE_DIALOGUE_TTS }
  | { type: ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT }
  | {
      type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT;
      payload: SceneObject;
    }
  | {
      type: ACTION_TYPES.SHOW_CONTROLPANELS_SCENEOBJECT;
      payload: SceneObject;
    }
  | { type: ACTION_TYPES.HIDE_EDITOR_LOADER }
  | {
      type: ACTION_TYPES.SHOW_EDITOR_LOADER;
      payload?: {
        showEditorLoader: {
          message: string | undefined;
        };
      };
    }
  | {
      type: ACTION_TYPES.ON_TIMELINE_RESIZE;
      payload: {
        timelineHeight: number;
      };
    }
  | {
      type: ACTION_TYPES.ON_CHANGE_VIEW_MODE;
      payload: {
        viewMode: ViewModes;
      };
    };
