import { State, Action, ACTION_TYPES } from "./types";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.OPEN_DIALOGUE_TTS: {
      return {
        ...state,
        diagloueTts: {
          isOpen: true,
        },
      };
    }
    case ACTION_TYPES.CLOSE_DIALOGUE_TTS: {
      return {
        ...state,
        diagloueTts: {
          isOpen: false,
        },
      };
    }
    case ACTION_TYPES.SHOW_CONTROLPANELS_SCENEOBJECT: {
      // console.log("pay", action.payload);
      return {
        ...state,
        controlPanel: {
          isShowing: true,
          currentSceneObject: action.payload,
        },
      };
    }
    case ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT: {
      return {
        ...state,
        controlPanel: {
          isShowing: state.controlPanel.isShowing,
          currentSceneObject: action.payload,
        },
      };
    }
    case ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT: {
      return {
        ...state,
        controlPanel: {
          ...state.controlPanel,
          isShowing: false,
        },
      };
    }
    case ACTION_TYPES.SHOW_EDITOR_LOADER: {
      return {
        ...state,
        showEditorLoader: {
          isShowing: true,
          message: action.payload?.showEditorLoader.message,
        },
      };
    }
    case ACTION_TYPES.HIDE_EDITOR_LOADER: {
      return {
        ...state,
        showEditorLoader: {
          isShowing: false,
          message: state.showEditorLoader.message,
        },
      };
    }
    case ACTION_TYPES.ON_TIMELINE_RESIZE: {
      return {
        ...state,
        timelineHeight: action.payload.timelineHeight,
      };
    }
    case ACTION_TYPES.ON_CHANGE_VIEW_MODE: {
      console.log(action);
      return {
        ...state,
        viewMode: action.payload.viewMode,
      };
    }
    default: {
      return state; //no change
    }
  } // end switch
}
