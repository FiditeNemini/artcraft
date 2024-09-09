import { MouseEventHandler } from "react";
import { signal, effect, Signal } from "@preact/signals-core";

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

export const eventsHandlers = Object.values(ToolbarImageButtonNames).reduce(
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
