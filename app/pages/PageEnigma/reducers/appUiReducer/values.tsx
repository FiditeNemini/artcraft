import {State,  VIEW_MODES} from './types';

export const initialStateValues : State = {
  timelineHeight: 260,
  viewMode: VIEW_MODES.EDITOR,
  showEditorLoader: {
    isShowing:true,
    message: 'loading Editor Engine 🦊'
  },
  showEditorLoadingBar: {
    isShowing:false,
    progress:0,
  }
}