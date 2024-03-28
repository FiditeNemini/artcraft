import { State, Action, ACTION_TYPES} from './types';

export function reducer(state: State, action: Action): State {
  switch(action.type){
    case ACTION_TYPES.SHOW_EDITOR_LOADER:{
      return{
        ...state,
        showEditorLoader: {
          isShowing: true,
          message: action.payload?.showEditorLoader.message,
        },
      }
    }
    case ACTION_TYPES.HIDE_EDITOR_LOADER:{
      return{
        ...state,
        showEditorLoader: {
          isShowing: false,
          message: state.showEditorLoader.message
        },
      }
    }
    case ACTION_TYPES.SHOW_EDITOR_LOADINGBAR:{
      return{
        ...state,
        showEditorLoadingBar: {
          ...action.payload?.showEditorLoadingBar,
          isShowing: true,
        },
      }
    }
    case ACTION_TYPES.UPDATE_EDITOR_LOADINGBAR:{
      return{
        ...state,
        showEditorLoadingBar: {
          ...state.showEditorLoadingBar,
          ...action.payload?.showEditorLoadingBar,
        },
      }
    }
    case ACTION_TYPES.HIDE_EDITOR_LOADINGBAR:{
      return{
        ...state,
        showEditorLoadingBar: {
          ...state.showEditorLoadingBar,
          isShowing: false,
        },
      }
    }
    case ACTION_TYPES.ON_TIMELINE_RESIZE:{
      return{
        ...state,
        timelineHeight: action.payload.timelineHeight,
      }
    }
    case ACTION_TYPES.ON_CHANGE_VIEW_MODE:{
      console.log(action);
      return{
        ...state,
        viewMode: action.payload.viewMode
      }
    }
    default:{
      return state; //no change
    }
  }// end switch
}
