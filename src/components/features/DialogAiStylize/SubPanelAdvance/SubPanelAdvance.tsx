import { StyleOptionSwitches } from "./StyleOptionSwitches";
import { AIStylizeProps } from "../utilities";
import { StyleStrengthSlider } from "./StyleStrengthSlider";

export const SubPanelAdvance = ({
  aiStylizeProps,
  onStylizeOptionsChanged,
}: {
  aiStylizeProps: AIStylizeProps;
  onStylizeOptionsChanged: (newOptions: Partial<AIStylizeProps>) => void;
}) => {
  const {
    cinematic,
    enginePreProcessing,
    faceDetail,
    lipSync,
    upscale,
    styleStrength,
  } = aiStylizeProps;

  return (
    <div className="flex w-full grow gap-2">
      <div className="flex w-2/3 flex-col">
        <h6>IP Adapter</h6>
      </div>
      <div className="flex w-1/3 flex-col gap-4">
        <h4>Advanced Options</h4>
        <StyleOptionSwitches
          faceDetail={faceDetail}
          upscale={upscale}
          lipSync={lipSync}
          cinematic={cinematic}
          enginePreProcessing={enginePreProcessing}
          onStylizeOptionsChanged={onStylizeOptionsChanged}
        />
        <br />
        <StyleStrengthSlider
          styleStrength={styleStrength}
          onStylizeOptionsChanged={onStylizeOptionsChanged}
        />
      </div>
    </div>
  );
};
