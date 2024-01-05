import React, { useState } from "react";
import { Button, NumberSlider, Panel, SegmentButtons, TempSelect, TempTextArea } from "components/common";
import { useChanger } from 'hooks';
import { onChanger } from 'resources';

interface SdInferencePanelProps {}

export default function SdInferencePanel(props: SdInferencePanelProps) {
  const [seed, seedSet] = useState(5);
  const [sampler, samplerSet] = useState("DPM++");
  const [width, widthSet] = useState(256);
  const [height, heightSet] = useState(256);
  const [cfgScale, cfgScaleSet] = useState(1);
  const [loRAPath, loRAPathSet] = useState(1);
  const [checkPoint, checkPointSet] = useState(1);
  const [batchSize, batchSizeSet] = useState(1);
  const [batchCount, batchCountSet] = useState(1);
  const onChange = onChanger({ batchCountSet, batchSizeSet, cfgScaleSet, checkPointSet, heightSet, loRAPathSet, samplerSet, seedSet, widthSet });



  const samplerOpts = [
    { label: "DPM++", value: "DPM++" },
    { label: "2M", value: "2M" },
    { label: "karras", value: "karras" },
  ];

  const dimensionOpts = [
    { label: "256", value: 256 },
    { label: "512", value: 512 },
    { label: "1024", value: 1024 }
  ];

  const tempDeleteMeOpts = [
    { label: "Something", value: 1 },
    { label: "Something else", value: 2 },
    { label: "Another thing", value: 3 }
  ];

  const batchSizeOpts = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 }
  ];

  const batchCountOpts = [
    { label: "1", value: 1 },
    { label: "2", value: 2 }
  ];

  // console.log("🚨",Math.pow(2,32));

  const { setProps } = useChanger({
    prompt: useState("")
  });

  return <Panel padding={true}>
    <TempTextArea {...{
      label: "Prompt",
      placeholder: "Enter a prompt",
      ...setProps("prompt")
    }}/>
    <TempTextArea {...{
      label: "Negative prompt",
      name: "negativePrompt",
      placeholder: "Enter a negative prompt"
    }}/>
    <NumberSlider {...{
      min: 5,
      max: 128,
      name: "seed",
      label: "Seed value",
      onChange,
      thumbTip: "Seed value",
      value: seed
    }}/>
    <TempSelect {...{
      label: "Sampler",
      name: "sampler",
      onChange,
      options: samplerOpts,
      value: sampler
    }}/>
    <SegmentButtons {...{
      label: "Width",
      name: "width",
      onChange,
      options: dimensionOpts,
      value: width
    }}/>
    <SegmentButtons {...{
      label: "Height",
      name: "height",
      onChange,
      options: dimensionOpts,
      value: height
    }}/>
    <NumberSlider {...{
      min: 1,
      max: 64,
      name: "cfgScale",
      label: "Cfg sscale",
      onChange,
      thumbTip: "Cfg sscale",
      value: cfgScale
    }}/>
    <TempSelect {...{
      label: "loRA path",
      name: "loraPath",
      onChange,
      options: tempDeleteMeOpts,
      value: loRAPath
    }}/>
    <TempSelect {...{
      label: "Check point",
      name: "checkPoint",
      onChange,
      options: tempDeleteMeOpts,
      value: checkPoint
    }}/>
    <SegmentButtons {...{
      label: "Batch size",
      name: "batchSize",
      onChange,
      options: batchSizeOpts,
      value: batchSize
    }}/>
    <SegmentButtons {...{
      label: "Batch count",
      name: "batchCount",
      onChange,
      options: batchCountOpts,
      value: batchCount
    }}/>
    <div className="d-flex gap-3 justify-content-end">
      <Button {...{
        label: "Enqueue"
      }} />
    </div>
  </Panel>;
}
