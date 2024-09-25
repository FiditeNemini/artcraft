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

export const dispatchers = {
  lock: lockDispatcher,
  ...buttonDispatchers,
};
export const eventsHandlers = {
  lock: {
    onClick: lockEventHandler,
  },
  ...buttonEventsHandlers,
};
