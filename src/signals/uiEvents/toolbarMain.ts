import { MouseEventHandler } from "react";
import { signal, effect, Signal } from "@preact/signals-core";

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

export const eventsHandlers = Object.values(ToolbarMainButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => {
        effect(() => {
          if (events[buttonName].value) {
            callback(events[buttonName].value);
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

export const dispatchers = Object.values(ToolbarMainButtonNames).reduce(
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
