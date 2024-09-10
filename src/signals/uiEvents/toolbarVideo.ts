import { MouseEventHandler } from "react";
import { signal, effect, Signal } from "@preact/signals-react";

import { ToolbarVideoButtonNames } from "~/components/features/ToolbarVideo/enums";

const events = Object.values(ToolbarVideoButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = signal<
      React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
    >();
    return acc;
  },
  {} as {
    [key in ToolbarVideoButtonNames]: Signal<
      (React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) | undefined
    >;
  },
);

export const eventsHandlers = Object.values(ToolbarVideoButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => {
        effect(() => {
          if (events[buttonName].value) {
            callback(events[buttonName].value);
            return () => {
              //console.log("Toolbar Video effect event handler cleanup");
              events[buttonName].value = undefined;
            };
          }
        });
      },
    };
    return acc;
  },
  {} as {
    [key in ToolbarVideoButtonNames]: {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => void;
    };
  },
);

export const dispatchers = Object.values(ToolbarVideoButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      events[buttonName].value = e;
    };
    return acc;
  },
  {} as {
    [key in ToolbarVideoButtonNames]: MouseEventHandler<HTMLButtonElement>;
  },
);
