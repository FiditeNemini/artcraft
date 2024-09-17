import { Field, Label, Switch } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { AIStylizeProps } from "../utilities";

export const StyleOptionSwitches = ({
  faceDetail,
  upscale,
  lipSync,
  cinematic,
  enginePreProcessing,
  onStylizeOptionsChanged,
}: {
  cinematic: boolean;
  enginePreProcessing: boolean;
  faceDetail: boolean;
  lipSync: boolean;
  upscale: boolean;
  onStylizeOptionsChanged: (newOptions: Partial<AIStylizeProps>) => void;
}) => {
  const handleCinematicChange = () => {
    onStylizeOptionsChanged({
      cinematic: !cinematic,
      upscale: !cinematic === true ? false : upscale,
    });
  };

  const enginePreProcessingChange = () => {
    onStylizeOptionsChanged({
      enginePreProcessing: !enginePreProcessing,
    });
  };

  const handleUpscaleChange = () => {
    onStylizeOptionsChanged({
      upscale: !upscale,
      cinematic: !upscale === true ? false : cinematic,
    });
  };

  const handleLipsyncChange = () => {
    onStylizeOptionsChanged({
      lipSync: !lipSync,
    });
  };

  const handleFaceDetailerChange = () => {
    onStylizeOptionsChanged({
      faceDetail: !faceDetail,
    });
  };

  const switchContainerBaseStyle =
    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-indigo-500 focus:ring-offset-0";
  const switchContainerStateStyle = (state: boolean) =>
    state ? "bg-primary hover:bg-primary-400" : "bg-gray-500 hover:bg-gray-400";
  const switchButtonBaseStyle =
    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform";
  const switchButtonStateStyle = (state: boolean) =>
    state ? "translate-x-6" : "translate-x-1";

  return (
    <div className="flex w-full flex-col gap-4 rounded-b-lg bg-ui-panel">
      <Field className="flex items-center">
        <Label className="mr-3 grow text-sm font-medium transition-opacity">
          Sync Lips with Speech
        </Label>
        <Switch
          checked={lipSync}
          onChange={handleLipsyncChange}
          className={twMerge(
            switchContainerBaseStyle,
            switchContainerStateStyle(lipSync),
          )}
        >
          <span
            className={twMerge(
              switchButtonBaseStyle,
              switchButtonStateStyle(lipSync),
            )}
          />
        </Switch>
      </Field>

      <Field className="flex items-center">
        <Label className="mr-3 grow text-sm font-medium transition-opacity">
          Face Detailer
        </Label>
        <Switch
          checked={faceDetail}
          onChange={handleFaceDetailerChange}
          className={twMerge(
            switchContainerBaseStyle,
            switchContainerStateStyle(faceDetail),
          )}
        >
          <span
            className={twMerge(
              switchButtonBaseStyle,
              switchButtonStateStyle(faceDetail),
            )}
          />
        </Switch>
      </Field>

      <Field className="flex items-center">
        <Label
          className={twMerge(
            "mr-3 grow text-sm font-medium transition-opacity",
            cinematic ? "opacity-50" : "",
          )}
        >
          Upscale
        </Label>
        <Switch
          checked={upscale}
          onChange={handleUpscaleChange}
          className={twMerge(
            switchContainerBaseStyle,
            switchContainerStateStyle(upscale),
          )}
        >
          <span
            className={twMerge(
              switchButtonBaseStyle,
              switchButtonStateStyle(upscale),
            )}
          />
        </Switch>
      </Field>

      <Field className="flex items-center">
        <Label
          className={twMerge(
            "mr-3 grow text-sm font-medium transition-opacity",
            upscale ? "opacity-50" : "",
          )}
        >
          Use Cinematic
        </Label>
        <Switch
          checked={cinematic}
          onChange={handleCinematicChange}
          className={twMerge(
            switchContainerBaseStyle,
            switchContainerStateStyle(cinematic),
          )}
        >
          <span
            className={twMerge(
              switchButtonBaseStyle,
              switchButtonStateStyle(cinematic),
            )}
          />
        </Switch>
      </Field>

      <Field className="flex items-center">
        <Label className="mr-3 grow text-sm font-medium transition-opacity">
          Engine Preprocessing
        </Label>
        <Switch
          checked={enginePreProcessing}
          onChange={enginePreProcessingChange}
          className={twMerge(
            switchContainerBaseStyle,
            switchContainerStateStyle(enginePreProcessing),
          )}
        >
          <span
            className={twMerge(
              switchButtonBaseStyle,
              switchButtonStateStyle(enginePreProcessing),
            )}
          />
        </Switch>
      </Field>
    </div>
  );
};
