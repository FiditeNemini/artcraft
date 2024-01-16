import React, { useState } from "react";
import {
  Button,
  Input,
  NumberSlider,
  Panel,
  SegmentButtons,
  TempSelect,
  TempTextArea,
} from "components/common";
// import { useChanger } from "hooks";
import { onChanger } from "resources";
import Accordion from "components/common/Accordion";
import {
  faRectangleLandscape,
  faRectanglePortrait,
  faSquare,
} from "@fortawesome/pro-solid-svg-icons";

interface SdInferencePanelProps {}

export default function SdInferencePanel(props: SdInferencePanelProps) {
  const [seed, seedSet] = useState("random");
  const [seedNumber, seedNumberSet] = useState("");
  const [sampler, samplerSet] = useState("DPM++ 2M Karras");
  const [aspectRatio, aspectRatioSet] = useState("square");
  const [cfgScale, cfgScaleSet] = useState(7);
  const [samples, samplesSet] = useState(8);
  const [loRAPath, loRAPathSet] = useState(1);
  // const [checkPoint, checkPointSet] = useState(1);
  const [batchCount, batchCountSet] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const onChange = onChanger({
    batchCountSet,
    cfgScaleSet,
    // checkPointSet,
    loRAPathSet,
    samplerSet,
    aspectRatioSet,
    setPrompt,
    setNegativePrompt,
    samplesSet,
  });

  const samplerOpts = [
    { label: "DPM++ 2M Karras", value: "DPM++ 2M Karras" },
    { label: "DPM++ SDE Karras", value: "DPM++ SDE Karras" },
    { label: "DPM++ 2M SDE Exponential", value: "DPM++ 2M SDE Exponential" },
    { label: "DPM++ 2M SDE Karras", value: "DPM++ 2M SDE Karras" },
    { label: "Euler a", value: "Euler a" },
    { label: "Euler", value: "Euler" },
    { label: "LMS", value: "LMS" },
    { label: "Heun", value: "Heun" },
    { label: "DPM2", value: "DPM2" },
    { label: "DPM2 a", value: "DPM2 a" },
    { label: "DPM++ 2S a", value: "DPM++ 2S a" },
    { label: "DPM++ 2M", value: "DPM++ 2M" },
    { label: "DPM++ SDE", value: "DPM++ SDE" },
    { label: "DPM++ 2M SDE", value: "DPM++ 2M SDE" },
    { label: "DPM++ 2M SDE Heun", value: "DPM++ 2M SDE Heun" },
    { label: "DPM++ 2M SDE Heun Karras", value: "DPM++ 2M SDE Heun Karras" },
    {
      label: "DPM++ 2M SDE Heun Exponential",
      value: "DPM++ 2M SDE Heun Exponential",
    },
    { label: "DPM++ 3M SDE", value: "DPM++ 3M SDE" },
    { label: "DPM++ 3M SDE Karras", value: "DPM++ 3M SDE Karras" },
    { label: "DPM++ 3M SDE Exponential", value: "DPM++ 3M SDE Exponential" },
    { label: "DPM fast", value: "DPM fast" },
    { label: "DPM adaptive", value: "DPM adaptive" },
    { label: "LMS Karras", value: "LMS Karras" },
    { label: "DPM2 Karras", value: "DPM2 Karras" },
    { label: "DPM2 a Karras", value: "DPM2 a Karras" },
    { label: "DPM++ 2S a Karras", value: "DPM++ 2S a Karras" },
  ];

  const dimensionOpts = [
    { label: "Square", value: "square", icon: faSquare, subLabel: "512x512" },
    {
      label: "Landscape",
      value: "landscape",
      icon: faRectangleLandscape,
      subLabel: "768x512",
    },
    {
      label: "Portrait",
      value: "portrait",
      icon: faRectanglePortrait,
      subLabel: "512x768",
    },
  ];

  const tempDeleteMeOpts = [
    { label: "Something", value: 1 },
    { label: "Something else", value: 2 },
    { label: "Another thing", value: 3 },
  ];

  const batchCountOpts = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
    { label: "7", value: 7 },
    { label: "8", value: 8 },
  ];

  const seedOpts = [
    { label: "Random", value: "random" },
    { label: "Custom", value: "custom" },
  ];

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPrompt(event.target.value);
  };

  const handleNegativePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNegativePrompt(event.target.value);
  };

  const generateRandomSeed = () => Math.floor(Math.random() * Math.pow(2, 32));

  const handleSeedChange = (option: any) => {
    const { value } = option.target;
    const randomSeed = generateRandomSeed();
    if (value === "custom") {
      if (seedNumber === "") {
        seedNumberSet(randomSeed.toString());
      }
      seedSet(value);
    } else {
      seedNumberSet(randomSeed.toString());
      seedSet(value);
    }
  };

  const handleSeedNumberChange = (event: any) => {
    seedNumberSet(event.target.value);
    seedSet("custom");
  };

  const handleBlur = () => {
    if (seedNumber === "") {
      seedSet("random");
    }
  };

  return (
    <Panel padding={true}>
      <h4 className="fw-semibold mb-4">Generate an Image</h4>

      <div className="d-flex flex-column gap-3 mb-4">
        <TempTextArea
          {...{
            label: "Prompt",
            placeholder: "Enter a prompt",
            onChange: handlePromptChange,
            value: prompt,
            required: true,
          }}
        />
        <TempTextArea
          {...{
            label: "Negative prompt",
            name: "negativePrompt",
            placeholder: "Enter a negative prompt",
            onChange: handleNegativePromptChange,
            value: negativePrompt,
          }}
        />
        <SegmentButtons
          {...{
            label: "Aspect Ratio",
            name: "aspectRatio",
            onChange,
            options: dimensionOpts,
            value: aspectRatio,
          }}
        />
      </div>

      <Accordion>
        <Accordion.Item title="Advanced">
          <div className="p-3 d-flex flex-column gap-3">
            <div>
              <label className="sub-title">Seed</label>
              <div className="d-flex gap-2">
                <SegmentButtons
                  {...{
                    name: "seed",
                    onChange: handleSeedChange,
                    options: seedOpts,
                    value: seed,
                  }}
                />
                <Input
                  placeholder="Random"
                  value={seedNumber}
                  onChange={handleSeedNumberChange}
                  type="number"
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <TempSelect
              {...{
                label: "Sampler",
                name: "sampler",
                onChange,
                options: samplerOpts,
                value: sampler,
              }}
            />

            <NumberSlider
              {...{
                min: 1,
                max: 30,
                name: "cfgScale",
                label: "CFG Scale",
                onChange,
                thumbTip: "CFG Scale",
                value: cfgScale,
              }}
            />

            <NumberSlider
              {...{
                min: 8,
                max: 64,
                name: "samples",
                label: "Samples",
                onChange,
                thumbTip: "Samples",
                value: samples,
              }}
            />
            <TempSelect
              {...{
                label: "loRA path",
                name: "loraPath",
                onChange,
                options: tempDeleteMeOpts,
                value: loRAPath,
              }}
            />
            {/* Checkpoint Use weight token */}
            {/* <TempSelect
              {...{
                label: "Checkpoint",
                name: "checkPoint",
                onChange,
                options: tempDeleteMeOpts,
                value: checkPoint,
              }}
            /> */}

            <SegmentButtons
              {...{
                label: "Number of Generations",
                name: "batchCount",
                onChange,
                options: batchCountOpts,
                value: batchCount,
              }}
            />
          </div>
        </Accordion.Item>
      </Accordion>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button
          {...{
            label: "Clear All",
            variant: "secondary",
          }}
        />
        <Button
          {...{
            label: "Generate Image",
            disabled: prompt === "",
          }}
        />
      </div>
    </Panel>
  );
}
