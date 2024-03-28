import {State, Action, ACTION_TYPES, VIEW_MODES} from './types';
import {reducer} from './reducer';

import { initialStateValues } from './values';

export type {
  State as AppUiState,
  Action as AppUiAction,
};

export {
  VIEW_MODES as APPUI_VIEW_MODES,
  ACTION_TYPES as APPUI_ACTION_TYPES,
  initialStateValues as appUiInitialStateValues,
  reducer as appUiReducer,
}