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
import { useJobStatus } from "hooks";
import EnqueueVideoStyleTransfer from "@storyteller/components/src/api/video_styleTransfer";
import { initialValues } from "./defaultValues";
import { mapRequest, VSTType } from "./helpers";
import LoadingSpinner from "components/common/LoadingSpinner";
// import SectionAdvanceOptions from "./sectionAdvanceOptions";

export default function PageVSTApp() {
  const { jobToken } = useParams<{ jobToken: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const history = useHistory();

  const job = useJobStatus({ jobToken });

  const [vstValues, setVstValues] = useState<VSTType>({
    ...initialValues,
    fileToken: job?.maybe_result?.entity_token || "",
  });

  const handleOnChange = (val: {
    [key: string]: number | string | boolean | undefined;
  }) => {
    setVstValues(curr => ({ ...curr, ...val }));
    console.log("VST Values", vstValues);
  };

  const handleGenerate = () => {
    const request = mapRequest(vstValues);
    EnqueueVideoStyleTransfer(request).then(res => {
      if (res.success && res.inference_job_token) {
        console.log("Job enqueued successfully", res.inference_job_token);
        history.push(`/studio-intro/result/${res.inference_job_token}`);
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
    Anime: "weight_yqexh77ntqyawzgh9fzash798", // set SD Model Weight Tokens, currently hardcoded all to Anime style
    Pixel: "weight_yqexh77ntqyawzgh9fzash798",
    Painting: "weight_yqexh77ntqyawzgh9fzash798",
  };

  const handleStyleSelection = (selected: string) => {
    const selectedSdModelToken = styleMap[selected];
    setVstValues(curr => ({ ...curr, sdModelToken: selectedSdModelToken }));
  };

  const styleOptions = Object.keys(styleMap);

  if (!jobToken) {
    history.push("/");
  }

  // Should also check if job actually exists or not
  //
  // if (!jobExists) {
  //   history.push("/");
  // }

  return (
    <Container type="panel" className="mt-5">
      <Panel clear={true}>
        <h2 className="fw-bold mb-0 mb-5 text-center">Style Your Scene</h2>
      </Panel>
      <Panel padding={true}>
        <div className="row g-5">
          <div className="col-12 col-md-6">
            {job.isSuccessful && job.maybe_result ? (
              <VideoQuickTrim
                mediaToken={job.maybe_result.entity_token}
                onSelect={(val: QuickTrimData) =>
                  handleOnChange({
                    trimStart: val.trimStartSeconds,
                    trimEnd: val.trimEndSeconds,
                  })
                }
              />
            ) : (
              <div className="ratio ratio-4x3 panel-inner rounded">
                <LoadingSpinner label="Loading Video" />
              </div>
            )}
          </div>
          <div className="col-12 col-md-6 d-flex flex-column gap-3 justify-content-center">
            <div>
              <label className="sub-title">Select a Style</label>
              <SelectionBubbles
                options={styleOptions}
                onSelect={handleStyleSelection}
                selectedStyle="outline"
              />
            </div>

            <TextArea
              label="Describe Your Scene"
              placeholder="Enter your description..."
              onChange={e => handleOnChange({ posPrompt: e.target.value })}
              value={vstValues.posPrompt}
              required={false}
              rows={5}
              resize={false}
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
            <div className="d-flex gap-2 justify-content-end mt-3">
              <NavLink to="/">
                <Button label="Cancel" variant="secondary" />
              </NavLink>
              <Button
                label="Generate Your Movie"
                onClick={handleGenerate}
                variant="primary"
                disabled={!job.isSuccessful}
              />
            </div>
          </div>
        </div>
      </Panel>
    </Container>
  );
}
