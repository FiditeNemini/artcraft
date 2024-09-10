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

export const eventsHandlers = Object.values(ToolbarImageButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = {
      onClick: (callback: () => void) => {
        effect(() => {
          if (events[buttonName].value) {
            callback();
            return () => {
              //console.log("Toolbar Image effect event handler cleanup");
              events[buttonName].value = undefined;
            };
          }
        });
      },
    };
    return acc;
  },
  {} as {
    [key in ToolbarImageButtonNames]: {
      onClick: (callback: () => void) => void;
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
