import {
  dispatchers as addMediaDispatchers,
  events as addMediaEvents,
} from "./addMedia";
import {
  dispatchers as toolbarMainDispatchers,
  eventsHandlers as toolbarMainEvents,
} from "./toolbarMain";
import {
  dispatchers as toolbarNodeDispatchers,
  eventsHandlers as toolbarNodeEvents,
} from "./toolbarNode";
import {
  dispatcher as buttonTestDispatcher,
  eventsHandler as buttonTestEvent,
} from "./buttonTest";
import {
  dispatcher as buttonRetryDispatcher,
  eventsHandler as buttonRetryEvent,
} from "./buttonRetry";
import { aiStylizeDispatchers, aiStylizeEvents } from "./aiStylize";

export const uiEvents = {
  ...addMediaEvents,
  aiStylize: aiStylizeEvents,
  buttonRetry: buttonRetryEvent,
  buttonTest: buttonTestEvent,
  toolbarMain: toolbarMainEvents,
  toolbarNode: toolbarNodeEvents,
};
export const dispatchUiEvents = {
  ...addMediaDispatchers,
  aiStylize: aiStylizeDispatchers,
  buttonRetry: buttonRetryDispatcher,
  buttonTest: buttonTestDispatcher,
  toolbarMain: toolbarMainDispatchers,
  toolbarNode: toolbarNodeDispatchers,
};
