import React, { useRef, useState } from "react";
import { NavLink, useParams, useHistory } from "react-router-dom";
import {
  Button,
  Container,
  Panel,
  SelectionBubbles,
  TextArea,
} from "components/common";
import VideoQuickTrim, {
  QuickTrimData,
} from "components/common/VideoQuickTrim";
import EnqueueVideoStyleTransfer from "@storyteller/components/src/api/video_styleTransfer";
import { initialValues } from "./defaultValues";
import { mapRequest, VSTType } from "./helpers";
// import SectionAdvanceOptions from "./sectionAdvanceOptions";

export default function PageVSTApp() {
  const { jobToken } = useParams<any>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [mediaToken, setMediaToken] = useState("");

  const [vstValues, setVstValues] = useState<VSTType>({
    ...initialValues,
    fileToken: mediaToken,
  });

  const handleOnChange = (val: {
    [key: string]: number | string | boolean | undefined;
  }) => {
    setVstValues(curr => ({ ...curr, ...val }));
  };

  const handleGenerate = () => {
    const request = mapRequest(vstValues);
    EnqueueVideoStyleTransfer(request).then(res => {
      if (res.success && res.inference_job_token) {
        console.log("Job enqueued successfully", res.inference_job_token);
        history.push(`/jobs`); // Adjusted to use a fixed path
      } else {
        console.log("Failed to enqueue job", res);
      }
    });
  };

  if (videoRef?.current) {
    const ve = videoRef.current;
    ve.onloadedmetadata = () => {
      const newValues: {
        width?: number;
        height?: number;
        maxDuration?: number;
      } = {};
      if (ve.duration) {
        newValues.maxDuration = ve.duration;
      }
      setVstValues(curr => ({
        ...curr,
        ...newValues,
      }));
    };
  }

  const styleMap: { [key: string]: string } = {
    Anime: "weight_yqexh77ntqyawzgh9fzash798",
    Pixel: "weight_yqexh77ntqyawzgh9fzash798",
    Painting: "weight_yqexh77ntqyawzgh9fzash798",
  };

  const handleStyleSelection = (selected: string) => {
    const selectedSdModelToken = styleMap[selected];
    setVstValues(curr => ({ ...curr, sdModelToken: selectedSdModelToken }));
  };

  const styleOptions = Object.keys(styleMap);

  return (
    <Container type="panel" className="mt-5">
      <Panel padding={true}>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <VideoQuickTrim
              mediaToken={vstValues.fileToken}
              onSelect={(val: QuickTrimData) =>
                handleOnChange({
                  trimStart: val.trimStartSeconds,
                  trimEnd: val.trimEndSeconds,
                })
              }
            />
          </div>
          <div className="col-12 col-md-6 d-flex flex-column gap-3">
            <div>
              <label className="sub-title">Select a Style</label>
              <SelectionBubbles
                options={styleOptions}
                onSelect={handleStyleSelection}
                selectedStyle="fill"
              />
            </div>

            <TextArea
              label="Prompt"
              placeholder="Enter your prompt"
              onChange={e => handleOnChange({ posPrompt: e.target.value })}
              value={vstValues.posPrompt}
              required={false}
            />
            {/* <TextArea
              label="Negative Prompt"
              placeholder="Enter your negative prompt"
              onChange={e => handleOnChange({ negPrompt: e.target.value })}
              value={vstValues.negPrompt}
              required={false}
            /> */}
            {/* <SectionAdvanceOptions
              onChange={handleOnChange}
              vstValues={vstValues}
            /> */}
          </div>
        </div>
        <div className="row g-3 mt-4">
          <div className="col-12 d-flex justify-content-between">
            <NavLink to="/">
              <Button label="Cancel" variant="primary" />
            </NavLink>
            <Button
              label="Enqueue"
              onClick={handleGenerate}
              variant="primary"
              disabled={vstValues.trimEnd === 0}
            />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
