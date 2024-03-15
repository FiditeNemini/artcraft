import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { NavLink, useParams, useHistory } from "react-router-dom";
import { Button, Container, Panel, TextArea } from "components/common";
// import VideoQuickTrim, {
//   QuickTrimData,
// } from "components/common/VideoQuickTrim";
import { VideoFakeyou } from "components/common";
import { useJobStatus } from "hooks";
import { EnqueueVST, EnqueueVSTResponse } from "@storyteller/components/src/api/video_styleTransfer/Enqueue_VST";
import { initialValues } from "./defaultValues";
import { VSTType } from "./helpers";
import LoadingSpinner from "components/common/LoadingSpinner";
import SelectionBubblesV2 from "components/common/SelectionBubblesV2";

export default function PageVSTApp() {
  const { jobToken } = useParams<{ jobToken: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const history = useHistory();

  const job = useJobStatus({ jobToken });

  const [vstValues, setVstValues] = useState<VSTType>({
    ...initialValues,
    // fileToken: job?.maybe_result?.entity_token || "",
  });

  // console.log(job);
  // console.log(job?.maybe_result);
  // console.log(job?.maybe_result?.entity_token);

  const handleOnChange = (val: {
    [key: string]: number | string | boolean | undefined;
  }) => {
    setVstValues(curr => ({ ...curr, ...val }));
  };

  const handleGenerate = () => {
    EnqueueVST("",{
      creator_set_visibility: vstValues.visibility,
      enable_lipsync: true,
      input_media_file_token: job?.maybe_result?.entity_token || "",
      negative_prompt: vstValues.negPrompt,
      prompt: vstValues.posPrompt,
      style: vstValues.sdModelToken,
      trim_end_millis: vstValues.trimEnd,
      trim_start_millis: vstValues.trimStart,
      uuid_idempotency_token: uuidv4()
    })
    .then((res: EnqueueVSTResponse) => {
      if (res.success && res.inference_job_token) {
        // console.log("Job enqueued successfully", res.inference_job_token);
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

  const styleOptions = [
    {
      label: "2D Anime",
      imageUrl: "/images/landing/onboarding/styles/style-2d-anime.webp",
      token: "weight_yqexh77ntqyawzgh9fzash798",
    },
    {
      label: "3D Cartoon",
      imageUrl: "/images/landing/onboarding/styles/style-3d-cartoon.webp",
      token: "weight_yqexh77ntqyawzgh9fzash798",
    },
    {
      label: "Ink B&W",
      imageUrl: "/images/landing/onboarding/styles/style-ink-bw.webp",
      token: "weight_yqexh77ntqyawzgh9fzash798",
    },
    {
      label: "Origami",
      imageUrl: "/images/landing/onboarding/styles/style-origami.webp",
      token: "weight_yqexh77ntqyawzgh9fzash798",
    },
  ];

  const handleStyleSelection = (selectedLabel: any) => {
    const selectedOption = styleOptions.find(
      option => option.label === selectedLabel
    );
    const selectedSdModelToken = selectedOption ? selectedOption.token : null;
    if (selectedSdModelToken) {
      setVstValues(curr => ({ ...curr, sdModelToken: selectedSdModelToken }));
    }
  };

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
              <VideoFakeyou
                mediaToken={job.maybe_result.entity_token}
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
              <SelectionBubblesV2
                options={Object.values(styleOptions)}
                onSelect={handleStyleSelection}
                selectedStyle="outline"
                variant="card"
                mobileSideScroll={true}
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
