import { MouseEventHandler } from "react";
import { signal, effect, Signal } from "@preact/signals-react";

import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

const events = Object.values(ToolbarMainButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = signal<
      React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
    >();
    return acc;
  },
  {} as {
    [key in ToolbarMainButtonNames]: Signal<
      (React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) | undefined
    >;
  },
);
const loadingBarRetryEvent = signal<
  React.MouseEvent<HTMLButtonElement> | undefined
>();

const effectsCleanups = Object.values(ToolbarMainButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = undefined;
    return acc;
  },
  {} as {
    [key in ToolbarMainButtonNames]: (() => void) | undefined;
  },
);

const buttonEventsHandlers = Object.values(ToolbarMainButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => {
        if (effectsCleanups[buttonName]) {
          effectsCleanups[buttonName]();
        }
        effectsCleanups[buttonName] = effect(() => {
          if (events[buttonName].value) {
            callback(events[buttonName].value);
            events[buttonName].value = undefined;
          }
        });
      },
    };
    return acc;
  },
  {} as {
    [key in ToolbarMainButtonNames]: {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => void;
    };
  },
);
let loadingBarRetryEffectCleanup: (() => void) | undefined = undefined;
const loadingBarRetryEventHandler = {
  onClick: (callback: MouseEventHandler<HTMLButtonElement>) => {
    if (loadingBarRetryEffectCleanup) {
      loadingBarRetryEffectCleanup();
    }
    loadingBarRetryEffectCleanup = effect(() => {
      if (loadingBarRetryEvent.value) {
        callback(loadingBarRetryEvent.value);
        loadingBarRetryEvent.value = undefined;
      }
    });
  },
};
export const eventsHandlers = {
  ...buttonEventsHandlers,
  loadingBarRetry: loadingBarRetryEventHandler,
};
const buttonDispatchers = Object.values(ToolbarMainButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      events[buttonName].value = e;
    };
    return acc;
  },
  {} as {
    [key in ToolbarMainButtonNames]: MouseEventHandler<HTMLButtonElement>;
  },
);
const loadingBarRetryDispatch = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log("toolbarMain > loadingBar > retry : onClick dispatched", e);
  loadingBarRetryEvent.value = e;
};
export const dispatchers = {
  ...buttonDispatchers,
  loadingBarRetry: loadingBarRetryDispatch,
};
