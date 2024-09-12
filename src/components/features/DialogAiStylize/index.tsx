import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faWandSparkles } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "~/components/ui";
import { paperWrapperStyles } from "~/components/styles";

import { ArtStyleNames } from "./enums";
import {
  generateRandomTextPositive,
  generateRandomTextNegative,
} from "./utilities";

import { Prompts } from "./Prompts";
import { ArtStyleSelector } from "./ArtStyleSelector";

export const DialogAiStylize = ({
  isOpen,
  closeCallback,
}: {
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  const [{ selectedArtStyle, positivePrompt, negativePrompt }, setState] =
    useState<{
      selectedArtStyle: ArtStyleNames;
      positivePrompt: string;
      negativePrompt: string;
    }>({
      selectedArtStyle: ArtStyleNames.Anime2DFlat,
      positivePrompt: generateRandomTextPositive(ArtStyleNames.Anime2DFlat),
      negativePrompt: generateRandomTextNegative(ArtStyleNames.Anime2DFlat),
    });

  function handleClose() {
    closeCallback();
  }

  function handleEnter() {
    // if (data) {
    //   dispatchUiEvents;
    // }
    handleClose();
  }
  const onSelectedArtStyle = useCallback((newArtstyle: ArtStyleNames) => {
    setState({
      selectedArtStyle: newArtstyle,
      positivePrompt: generateRandomTextPositive(newArtstyle),
      negativePrompt: generateRandomTextNegative(newArtstyle),
    });
  }, []);
  const onChangeNegativePrompt = useCallback((newPrompt: string) => {
    setState((curr) => ({ ...curr, negativePrompt: newPrompt }));
  }, []);
  const onChangePositivePrompt = useCallback((newPrompt: string) => {
    setState((curr) => ({ ...curr, positivePrompt: newPrompt }));
  }, []);

  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <DialogPanel
          className={twMerge(
            paperWrapperStyles,
            "flex w-full max-w-5xl flex-col gap-4 px-6 py-4",
          )}
        >
          <DialogTitle className="font-bold">Use AI to Stylize</DialogTitle>
          <div className="flex w-full gap-2">
            <div className="w-2/3">
              <h4>Pick a Style</h4>
              <ArtStyleSelector
                onSelectedArtStyle={onSelectedArtStyle}
                selectedArtStyle={selectedArtStyle}
              />
            </div>
            <div className="w-1/3">
              <Prompts
                selectedArtStyle={selectedArtStyle}
                positivePrompt={positivePrompt}
                negativePrompt={negativePrompt}
                onChangePositivePrompt={onChangePositivePrompt}
                onChangeNegativePrompt={onChangeNegativePrompt}
              />
            </div>
          </div>
          <div className="flex w-full justify-end gap-4">
            <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button
              className="hover:animate-pulse"
              icon={faWandSparkles}
              onClick={handleEnter}
            >
              Generate
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
