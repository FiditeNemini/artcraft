import { MouseEventHandler } from "react";
import { signal, effect, Signal } from "@preact/signals-react";

import { ToolbarImageButtonNames } from "~/components/features/ToolbarImage/enums";

const events = Object.values(ToolbarImageButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = signal<
      React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
    >();
    return acc;
  },
  {} as {
    [key in ToolbarImageButtonNames]: Signal<
      (React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) | undefined
    >;
  },
);

const effectsCleanups = Object.values(ToolbarImageButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = undefined;
    return acc;
  },
  {} as {
    [key in ToolbarImageButtonNames]: (() => void) | undefined;
  },
);

export const eventsHandlers = Object.values(ToolbarImageButtonNames).reduce(
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
    [key in ToolbarImageButtonNames]: {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => void;
    };
  },
);

export const dispatchers = Object.values(ToolbarImageButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      events[buttonName].value = e;
    };
    return acc;
  },
  {} as {
    [key in ToolbarImageButtonNames]: MouseEventHandler<HTMLButtonElement>;
  },
);
