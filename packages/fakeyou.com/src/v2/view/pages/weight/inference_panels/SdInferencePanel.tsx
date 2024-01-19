import React, { useRef, useState } from "react";
import {
  Button,
  Input,
  NumberSlider,
  Panel,
  SegmentButtons,
  TempSelect,
  TempTextArea,
} from "components/common";
import { onChanger } from "resources";
import Accordion from "components/common/Accordion";
import {
  faRectangleLandscape,
  faRectanglePortrait,
  faSquare,
} from "@fortawesome/pro-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import {
  EnqueueImageGen,
  EnqueueImageGenIsSuccess,
  EnqueueImageGenIsError,
} from "@storyteller/components/src/api/image_generation/EnqueueImageGen";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import useToken from "hooks/useToken";
import SelectSearcher from "components/common/SelectSearcher/SelectSearcher";

interface SdInferencePanelProps {
  sd_model_token: string;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
}

export default function SdInferencePanel({
  enqueueInferenceJob,
  sd_model_token,
}: SdInferencePanelProps) {
  const { token: loraToken } = useToken();
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [seed, seedSet] = useState("random");
  const [seedNumber, seedNumberSet] = useState("");
  const [sampler, samplerSet] = useState("DPM++ 2M Karras");
  const [aspectRatio, aspectRatioSet] = useState("square");
  const [cfgScale, cfgScaleSet] = useState(7);
  const [samples, samplesSet] = useState(8);
  const [batchCount, batchCountSet] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const onChange = onChanger({
    batchCountSet,
    cfgScaleSet,
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

  let imageWidth: number;
  let imageHeight: number;

  switch (aspectRatio) {
    case "square":
      imageWidth = 512;
      imageHeight = 512;
      break;
    case "landscape":
      imageWidth = 768;
      imageHeight = 512;
      break;
    case "portrait":
      imageWidth = 512;
      imageHeight = 768;
      break;
    default:
      throw new Error("Invalid aspect ratio");
  }

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
  const internalSeed = useRef(generateRandomSeed()); // useRef to hold the internal seed

  const handleSeedChange = (option: any) => {
    const { value } = option.target;

    if (value === "custom") {
      if (seedNumber === "") {
        const randomSeed = generateRandomSeed();
        internalSeed.current = randomSeed;
        seedNumberSet(randomSeed.toString());
      }
      seedSet(value);
    } else {
      seedSet(value);
      seedNumberSet("");
      internalSeed.current = generateRandomSeed(); // Generate a new random seed when switching back to "Random"
    }
  };

  const handleSeedNumberChange = (event: any) => {
    const customSeed = event.target.value;
    seedNumberSet(customSeed);
    internalSeed.current =
      customSeed !== "" ? parseInt(customSeed, 10) : generateRandomSeed();
    seedSet("custom");
  };

  const handleBlur = () => {
    if (seedNumber === "") {
      seedSet("random");
    }
  };

  const handleEnqueueImageGen = async (
    ev: React.FormEvent<HTMLButtonElement>
  ) => {
    ev.preventDefault();

    if (!prompt) {
      return false;
    }

    setIsEnqueuing(true);

    //make sure seed is random on generation if random is selected
    if (seed === "random") {
      internalSeed.current = generateRandomSeed();
    }

    const request = {
      uuid_idempotency_token: uuidv4(),
      maybe_sd_model_token: sd_model_token,
      maybe_lora_model_token: loraToken,
      maybe_prompt: prompt,
      maybe_n_prompt: negativePrompt,
      maybe_seed: internalSeed.current,
      maybe_width: imageWidth,
      maybe_height: imageHeight,
      maybe_sampler: sampler,
      maybe_cfg_scale: cfgScale,
      maybe_number_of_samples: samples,
      maybe_batch_count: batchCount,
    };

    console.log("request", request);

    const response = await EnqueueImageGen(request);

    if (EnqueueImageGenIsSuccess(response)) {
      console.log("enqueuing...");

      if (response.inference_job_token) {
        enqueueInferenceJob(
          response.inference_job_token,
          FrontendInferenceJobType.ImageGeneration
        );
      }
    } else if (EnqueueImageGenIsError(response)) {
      console.log("error");
    }
    setIsEnqueuing(false);

    return false;
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
              <div className="d-flex gap-2 align-items-center">
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
                step: 0.5,
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

            <SelectSearcher
              label="Additional LoRA Weight"
              tabs={[
                {
                  label: "All LoRA Weights",
                  searcherKey: "allLoraWeights",
                  weightTypeFilter: "lora",
                },
                {
                  label: "Bookmarked",
                  searcherKey: "bookmarkedLoraWeights",
                  weightTypeFilter: "lora",
                },
              ]}
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
            onClick: handleEnqueueImageGen,
            isLoading: isEnqueuing,
          }}
        />
      </div>
    </Panel>
  );
}
