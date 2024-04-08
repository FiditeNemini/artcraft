import React, { useState } from "react";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import { useInferenceJobs } from "hooks";
import { Button, Container, Panel, TextArea, TempSelect as Select } from "components/common";
import { EntityInput } from "components/entities";
import {
  EnqueueVST,
  EnqueueVSTResponse
} from "@storyteller/components/src/api/video_styleTransfer/Enqueue_VST";
import "./StyleVideo.scss";
import { useParams } from "react-router-dom";
import { STYLE_OPTIONS } from "common/StyleOptions";

export default function StyleVideo() {
  const { mediaToken: pageMediaToken } = useParams<{ mediaToken: string }>();

  const [style, styleSet] = useState("anime_2d_flat");
  const [mediaToken, mediaTokenSet] = useState(pageMediaToken || "");
  const [prompt, promptSet] = useState("");
  const [negativePrompt, negativePromptSet] = useState("");
  const { enqueue } = useInferenceJobs();

  const onClick = () => {
    if (mediaToken) {
      EnqueueVST("",{
        creator_set_visibility: "private",
        enable_lipsync: true,
        input_file: mediaToken,
        negative_prompt: negativePrompt,
        prompt,
        style,
        trim_end_millis: 3000,
        trim_start_millis: 0,
        uuid_idempotency_token: uuidv4()
      })
      .then((res: EnqueueVSTResponse) => {
        if (res.success && res.inference_job_token) {
          enqueue(res.inference_job_token,true,FrontendInferenceJobType.VideoStyleTransfer);
        } else {
          console.log("Failed to enqueue job", res);
        }
      });
    }
  };

  const options = STYLE_OPTIONS.map((option) => {
    return {
      label: option.label, 
      value: option.value,
    }
  });

  return <Container {...{ className: "fy-style-video-page mt-5", type: "panel" }}>
      <Panel {...{ padding: true }}>
        <header className="d-flex gap-3 flex-wrap">
          <h1 className="fw-semibold">
            Style a Video
          </h1>
        </header>
        <EntityInput {...{
          accept: ["video"],
          aspectRatio: "landscape",
          label: "Choose a video",
          name: "mediaToken",
          value: pageMediaToken,
          onChange: ({ target }: { target: any }) => { mediaTokenSet(target.value) },
          type: "media"
        }}/>
        <Select {...{
          label: "Style",
          onChange: ({ target }: { target: any }) => { styleSet(target.value) },
          options,
          value: style
        }}/>
        <div {...{ className: "prompt-row" }}>
          <TextArea {...{
            label: "Positive prompt",
            rows: 5,
            onChange: ({ target }: { target: any }) => { promptSet(target.value) },
          }}/>
          <TextArea {...{
            label: "Negative prompt",
            rows: 5,
            onChange: ({ target }: { target: any }) => { negativePromptSet(target.value) },
          }}/>
        </div>
        <div {...{ className: "d-flex justify-content-center mt-3" }}>
          <Button {...{
            disabled: !mediaToken,
            label: "Style",
            onClick,
            variant: "primary"
          }} />
        </div>
      </Panel>
   </Container>;
};