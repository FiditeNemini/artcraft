import { MouseEventHandler } from "react";
import { signal, effect } from "@preact/signals-core";

import { ToolbarImageButtonNames } from "~/components/features/ToolbarImage/enums";

const events = signal<{
  [key in ToolbarImageButtonNames]?: React.MouseEvent<
    HTMLButtonElement,
    MouseEvent
  >;
}>();

export const eventsHandlers = Object.values(ToolbarImageButtonNames).reduce(
  (acc, buttonName) => {
    acc[buttonName] = {
      onClick: (callback: MouseEventHandler<HTMLButtonElement>) => {
        effect(() => {
          if (events.value?.[buttonName]) {
            callback(events.value?.[buttonName]);
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
      events.value = {
        ...events.value,
        [buttonName]: e,
      };
    };
    return acc;
  },
  {} as {
    [key in ToolbarImageButtonNames]: MouseEventHandler<HTMLButtonElement>;
  },
);
