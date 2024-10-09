import { MouseEventHandler } from "react";
import { signal, effect, Signal } from "@preact/signals-react";

import { ToolbarNodeButtonNames as ButtonNames } from "~/components/features/ToolbarNode/enums";
const lockEvent = signal<React.MouseEvent<HTMLButtonElement> | undefined>();
let lockEffectCleanup: (() => void) | undefined;
const lockEventHandler = (callback: MouseEventHandler<HTMLButtonElement>) => {
  if (lockEffectCleanup) {
    lockEffectCleanup();
  }
  lockEffectCleanup = effect(() => {
    if (lockEvent.value) {
      callback(lockEvent.value);
      lockEvent.value = undefined;
    }
  });
};
const lockDispatcher = (e: React.MouseEvent<HTMLButtonElement>) => {
  lockEvent.value = e;
};

const buttonEvents = Object.values(ButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = signal<
      React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
    >();
    return acc;
  },
  {} as {
    [key in ButtonNames]: Signal<
      (React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) | undefined
    >;
  },
);

const effectsCleanups = Object.values(ButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = undefined;
    return acc;
  },
  {} as {
    [key in ButtonNames]: (() => void) | undefined;
  },
);

const buttonEventsHandlers = Object.values(ButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => {
        if (effectsCleanups[buttonName]) {
          effectsCleanups[buttonName]();
        }
        effectsCleanups[buttonName] = effect(() => {
          if (buttonEvents[buttonName].value) {
            callback(buttonEvents[buttonName].value);
            buttonEvents[buttonName].value = undefined;
          }
        });
      },
    };
    return acc;
  },
  {} as {
    [key in ButtonNames]: {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => void;
    };
  },
);

const buttonDispatchers = Object.values(ButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      buttonEvents[buttonName].value = e;
    };
    return acc;
  },
  {} as {
    [key in ButtonNames]: MouseEventHandler<HTMLButtonElement>;
  },
);

const retryEvent = signal<React.MouseEvent<HTMLButtonElement> | undefined>();
let lastRetryEventTimeStamp: number | undefined = undefined;
let retryEffectCleanup: (() => void) | undefined;
const retryEventHandler = (callback: MouseEventHandler<HTMLButtonElement>) => {
  if (retryEffectCleanup) {
    retryEffectCleanup();
  }
  retryEffectCleanup = effect(() => {
    if (retryEvent.value) {
      if (
        lastRetryEventTimeStamp === undefined ||
        lastRetryEventTimeStamp !== retryEvent.value.timeStamp
      ) {
        lastRetryEventTimeStamp = retryEvent.value.timeStamp;
        callback(retryEvent.value);
      }
    }
  });
};

const retryDispatcher = (e: React.MouseEvent<HTMLButtonElement>) => {
  retryEvent.value = e;
};
export const dispatchers = {
  lock: lockDispatcher,
  retry: retryDispatcher,
  ...buttonDispatchers,
};
export const eventsHandlers = {
  lock: {
    onClick: lockEventHandler,
  },
  retry: {
    onClick: retryEventHandler,
  },
  ...buttonEventsHandlers,
};
