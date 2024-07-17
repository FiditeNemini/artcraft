import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { NavLink, useParams, useHistory } from "react-router-dom";
import { Button, Container, Panel, Select, TextArea } from "components/common";

// import { VideoPlayer } from "components/common/VideoPlayer";
import { useJobStatus, useInferenceJobs, useMedia } from "hooks";
import {
  EnqueueVST,
  EnqueueVSTResponse,
} from "@storyteller/components/src/api/workflows/EnqueueVST";
import { initialValues } from "./defaultValues";
import { VSTType } from "./helpers";
import LoadingSpinner from "components/common/LoadingSpinner";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { STYLE_OPTIONS, StyleOption } from "common/StyleOptions";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";

export default function PageVSTApp() {
  const { jobToken } = useParams<{ jobToken: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const history = useHistory();

  const job = useJobStatus({ jobToken });

  const { enqueue } = useInferenceJobs();

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
    EnqueueVST("", {
      creator_set_visibility: vstValues.visibility,
      enable_lipsync: false,
      input_file: job?.maybe_result?.entity_token || "",
      negative_prompt: vstValues.negPrompt,
      prompt: vstValues.posPrompt,
      style: vstValues.sdModelToken,
      trim_end_millis: 3000,
      trim_start_millis: 0,
      uuid_idempotency_token: uuidv4(),
    }).then((res: EnqueueVSTResponse) => {
      if (res.success && res.inference_job_token) {
        enqueue(
          res.inference_job_token,
          FrontendInferenceJobType.VideoStyleTransfer
        );
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

  const handleStyleSelection = (selectedOption: StyleOption) => {
    console.log("option", selectedOption);
    const selectedSdModelToken = selectedOption ? selectedOption.value : null;
    if (selectedSdModelToken) {
      setVstValues(curr => ({ ...curr, sdModelToken: selectedSdModelToken }));
    }
  };

  if (!jobToken) {
    history.push("/");
  }

  // const contentSwitch = () => {
  //   switch (job.jobState) {
  //     case JobState.UNKNOWN:
  //     case JobState.PENDING:
  //     case JobState.STARTED: return <LoadingSpinner label="Loading Video" />;
  //     case JobState.ATTEMPT_FAILED: return <div {...{ className: "d-flex justify-content-center align-items-center" }}>
  //      { `Video compositor attempt failed, retrying (attempt ${ job.attemptCount } )` }
  //     </div>;
  //     case JobState.COMPLETE_SUCCESS: return <VideoFakeyou mediaToken={job.maybe_result.entity_token}/>;
  //     case JobState.DEAD: return <div>Job dead</div>;
  //     case JobState.CANCELED_BY_USER: return <div>Job canceled by user</div>;
  //   };
  // }

  // Should also check if job actually exists or not
  //
  // if (!jobExists) {
  //   history.push("/");
  // }

  const { media } = useMedia({
    mediaToken: job?.maybe_result?.entity_token,
  });

  const mediaLink =
    media?.public_bucket_path &&
    new BucketConfig().getGcsUrl(media?.public_bucket_path || "");

  return (
    <Container type="panel" className="mt-5">
      <Panel clear={true}>
        <h2 className="fw-bold mb-0 mb-5 text-center">Style Your Scene</h2>
      </Panel>
      <Panel padding={true}>
        <div className="row g-5">
          <div className="col-12 col-md-6">
            {job.isSuccessful && job.maybe_result ? (
              <div className="ratio ratio-4x3 panel-inner rounded">
                <video src={mediaLink} controls />
              </div>
            ) : (
              <div className="ratio ratio-4x3 panel-inner rounded">
                <LoadingSpinner label="Loading Video" />
              </div>
            )}
          </div>
          <div className="col-12 col-md-6 d-flex flex-column gap-3 justify-content-center">
            <div>
              <label className="sub-title">Select a Style</label>
              <Select
                label="Label"
                options={STYLE_OPTIONS}
                onChange={handleStyleSelection}
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
