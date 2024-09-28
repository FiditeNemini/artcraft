import {
  // useState,
  useRef,
} from "react";
import { twMerge } from "tailwind-merge";

import { DialogPanel, DialogTitle } from "@headlessui/react";

import { Button } from "~/components/ui";
import { ChromakeyProps, DialogChromakeyProps } from "./type";
import { paperWrapperStyles } from "~/components/styles";

export const DialogPanelChromakey = ({
  isChromakeyEnabled,
  chromakeyColor,
  onClose,
  onConfirm,
}: Omit<DialogChromakeyProps, "isShowing">) => {
  const prevState = useRef<ChromakeyProps>({
    isChromakeyEnabled,
    chromakeyColor,
  });

  // Needed later on when we need to facilitate changing colors
  // const [newState, setNewState] = useState<ChromakeyProps>({
  //   isChromakeyEnabled,
  //   color,
  // });

  const handleConfirm = () => {
    onConfirm({
      isChromakeyEnabled: !prevState.current.isChromakeyEnabled,
      chromakeyColor: prevState.current.chromakeyColor,
    });
    onClose();
  };

  return (
    <DialogPanel
      className={twMerge(paperWrapperStyles, "w-full max-w-lg space-y-4 p-8")}
    >
      <DialogTitle className="font-bold">Chroma Key</DialogTitle>
      <div>
        <p>Turn on chroma key for this node.</p>
        <p>
          The key'ing color is:{" "}
          {`rgb(${chromakeyColor?.red},${chromakeyColor?.green},${chromakeyColor?.blue})`}
        </p>
      </div>
      <div className="flex justify-end gap-4">
        <Button onClick={onClose}>Close</Button>

        <Button onClick={handleConfirm}>
          {prevState.current.isChromakeyEnabled ? "Turn off" : "Turn On"}
        </Button>
      </div>
    </DialogPanel>
  );
};
