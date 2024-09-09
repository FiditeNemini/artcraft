import {
  dispatchers as addMediaDispatchers,
  events as addMediaEvents,
} from "./addMedia";
import {
  dispatchers as imageToolbarDispatchers,
  eventsHandlers as imageToolbarEvents,
} from "./toolbarImage";
import {
  dispatchers as videoToolbarDispatchers,
  eventsHandlers as videoToolbarEvents,
} from "./toolbarVideo";
import {
  dispatchers as toolbarMainDispatchers,
  eventsHandlers as toolbarMainEvents,
} from "./toolbarMain";

export const uiEvents = {
  ...addMediaEvents,
  imageToolbar: imageToolbarEvents,
  toolbarMain: toolbarMainEvents,
  toolbarVideo: videoToolbarEvents,
};
export const dispatchUiEvents = {
  ...addMediaDispatchers,
  imageToolbar: imageToolbarDispatchers,
  toolbarMain: toolbarMainDispatchers,
  toolbarVideo: videoToolbarDispatchers,
};
