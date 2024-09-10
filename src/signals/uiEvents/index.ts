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
import {
  dispatcher as buttonTestDispatcher,
  eventsHandler as buttonTestEvent,
} from "./buttonTest";

export const uiEvents = {
  ...addMediaEvents,
  buttonTest: buttonTestEvent,
  imageToolbar: imageToolbarEvents,
  toolbarMain: toolbarMainEvents,
  toolbarVideo: videoToolbarEvents,
};
export const dispatchUiEvents = {
  ...addMediaDispatchers,
  buttonTest: buttonTestDispatcher,
  imageToolbar: imageToolbarDispatchers,
  toolbarMain: toolbarMainDispatchers,
  toolbarVideo: videoToolbarDispatchers,
};
