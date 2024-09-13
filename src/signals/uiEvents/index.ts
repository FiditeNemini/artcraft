import {
  dispatchers as addMediaDispatchers,
  events as addMediaEvents,
} from "./addMedia";
import {
  dispatchers as toolbarImageDispatchers,
  eventsHandlers as toolbarImageEvents,
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
import {
  dispatcher as buttonRetryDispatcher,
  eventsHandler as buttonRetryEvent,
} from "./buttonRetry";
import { requestAiStylize, onRequestAiStylize } from "./aiStylize";

export const uiEvents = {
  ...addMediaEvents,
  onRequestAiStylize,
  buttonRetry: buttonRetryEvent,
  buttonTest: buttonTestEvent,
  toolbarImage: toolbarImageEvents,
  toolbarMain: toolbarMainEvents,
  toolbarVideo: videoToolbarEvents,
};
export const dispatchUiEvents = {
  ...addMediaDispatchers,
  requestAiStylize,
  buttonRetry: buttonRetryDispatcher,
  buttonTest: buttonTestDispatcher,
  toolbarImage: toolbarImageDispatchers,
  toolbarMain: toolbarMainDispatchers,
  toolbarVideo: videoToolbarDispatchers,
};
