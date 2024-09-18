import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  faWandSparkles,
  faChevronLeft,
} from "@fortawesome/pro-solid-svg-icons";

import { Button } from "~/components/ui";
import {
  dialogBackgroundStyles,
  paperWrapperStyles,
} from "~/components/styles";

import { ArtStyleNames, SubPanelNames } from "./enums";
import {
  generateRandomTextPositive,
  generateRandomTextNegative,
  AIStylizeProps,
  initialValues,
} from "./utilities";

import { SubPanelBasic } from "./SubPanelBasic";
import { SubPanelAdvance } from "./SubPanelAdvance";

export const DialogAiStylize = ({
  isOpen,
  closeCallback,
  onRequestAIStylize,
}: {
  isOpen: boolean;
  closeCallback: () => void;
  onRequestAIStylize: (data: AIStylizeProps) => void;
}) => {
  const [state, setState] = useState<
    AIStylizeProps & { panelState: SubPanelNames }
  >({
    ...initialValues,
    panelState: SubPanelNames.BASIC,
  });
  const { panelState, ...aiStylizeProps } = state;
  const { selectedArtStyle, positivePrompt, negativePrompt } = aiStylizeProps;

  function handleGenerate() {
    onRequestAIStylize(aiStylizeProps);
    closeCallback();
  }
  const onChangePanel = useCallback((newP: SubPanelNames) => {
    setState((curr) => ({ ...curr, panelState: newP }));
  }, []);
  const setStylizeOptions = useCallback(
    (newOptions: Partial<AIStylizeProps>) => {
      setState((curr) => ({ ...curr, ...newOptions }));
    },
    [],
  );
  const onSelectedArtStyle = useCallback((newArtstyle: ArtStyleNames) => {
    setStylizeOptions({
      selectedArtStyle: newArtstyle,
      positivePrompt: generateRandomTextPositive(newArtstyle),
      negativePrompt: generateRandomTextNegative(newArtstyle),
    });
  }, []);
  const onChangeNegativePrompt = useCallback((newPrompt: string) => {
    setStylizeOptions({ negativePrompt: newPrompt });
  }, []);
  const onChangePositivePrompt = useCallback((newPrompt: string) => {
    setStylizeOptions({ positivePrompt: newPrompt });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setState({ ...initialValues, panelState: SubPanelNames.BASIC });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className={dialogBackgroundStyles}>
        <DialogPanel
          className={twMerge(
            paperWrapperStyles,
            "flex w-full max-w-5xl flex-col justify-between gap-4 px-6 pb-6 pt-4",
          )}
          style={{ height: "calc(100vh - 200px)" }}
        >
          {panelState === SubPanelNames.BASIC && (
            <>
              <DialogTitle className="font-bold">
                Use AI to Stylize{" "}
              </DialogTitle>
              <SubPanelBasic
                selectedArtStyle={selectedArtStyle}
                positivePrompt={positivePrompt}
                negativePrompt={negativePrompt}
                onSelectedArtStyle={onSelectedArtStyle}
                onChangeNegativePrompt={onChangeNegativePrompt}
                onChangePositivePrompt={onChangePositivePrompt}
                onChangePanel={onChangePanel}
              />
            </>
          )}
          {panelState === SubPanelNames.ADVANCED && (
            <>
              <Button
                onClick={() => onChangePanel(SubPanelNames.BASIC)}
                variant="tertiary"
                className="my-1 w-fit"
                icon={faChevronLeft}
              >
                Back to Basic Options
              </Button>
              <SubPanelAdvance
                aiStylizeProps={aiStylizeProps}
                onStylizeOptionsChanged={setStylizeOptions}
              />
            </>
          )}
          <div className="flex w-full justify-center gap-4">
            <Button onClick={closeCallback} variant="secondary">
              Cancel
            </Button>

            <Button
              className="hover:animate-pulse"
              icon={faWandSparkles}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
