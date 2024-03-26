import {State, Action, ACTION_TYPES, VIEW_MODES} from './types';
import {reducer} from './reducer';

const initialState:State = {
  timelineHeight: 260,
  viewMode: VIEW_MODES.EDITOR
}

export type {State, Action};
export {
  ACTION_TYPES,
  initialState,
  reducer,
}