import {
  dispatchers as addMediaDispatchers,
  events as addMediaEvents,
} from "./addMedia";
import {
  dispatchers as imageToolbarDispatchers,
  eventsHandlers as imageToolbarEvents,
} from "./imageToolbar";
import {
  dispatchers as toolbarMainDispatchers,
  eventsHandlers as toolbarMainEvents,
} from "./toolbarMain";

export const uiEvents = {
  ...addMediaEvents,
  imageToolbar: imageToolbarEvents,
  toolbarMain: toolbarMainEvents,
};
export const dispatchUiEvents = {
  ...addMediaDispatchers,
  imageToolbar: imageToolbarDispatchers,
  toolbarMain: toolbarMainDispatchers,
};
