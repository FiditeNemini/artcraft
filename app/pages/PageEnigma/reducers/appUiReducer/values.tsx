import {State,  VIEW_MODES} from './types';

export const initialStateValues : State = {
  timelineHeight: 260,
  viewMode: VIEW_MODES.EDITOR,
  showEditorLoader: {
    isShowing:false,
    message: 'Loading Editor Engine 🦊'
  },
  showEditorLoadingBar: {
    isShowing:true,
    progress:5,
    message: 'Loading Editor Engine 🦊'
  }
}