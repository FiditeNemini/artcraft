import { State, Action, ACTION_TYPES} from './types';

export function reducer(state: State, action: Action): State {
  switch(action.type){
    case ACTION_TYPES.SHOW_EDITOR_LOADER:{
      return{
        ...state,
        showEditorLoader: {
          isShow: true,
          message: action.payload?.showEditorLoader.message || undefined,
        },
      }
    }
    case ACTION_TYPES.HIDE_EDITOR_LOADER:{
      return{
        ...state,
        showEditorLoader: {
          isShow: false,
          message: state.showEditorLoader.message
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
