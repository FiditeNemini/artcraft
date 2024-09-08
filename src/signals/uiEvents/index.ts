import {
  dispatchers as addMediaDispatchers,
  events as addMediaEvents,
} from "./addMedia";
import {
  dispatchers as imageToolbarDispatchers,
  eventsHandlers as imageToolbarEvents,
} from "./imageToolbar";

export const uiEvents = {
  ...addMediaEvents,
  imageToolbar: imageToolbarEvents,
};
export const dispatchUiEvents = {
  ...addMediaDispatchers,
  imageToolbar: imageToolbarDispatchers,
};
