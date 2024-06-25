import React, { useState } from "react";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import { useInferenceJobs, useSession } from "hooks";
import {
  Button,
  Container,
  Panel,
  SegmentButtons,
  TextArea,
  Slider,
  TempSelect as Select,
} from "components/common";
import { EntityInput } from "components/entities";
import {
  EnqueueVST,
  EnqueueVSTResponse,
} from "@storyteller/components/src/api/video_styleTransfer/Enqueue_VST";
import "./StyleVideo.scss";
import { useParams } from "react-router-dom";
import { STYLE_OPTIONS } from "common/StyleOptions";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";

export default function StyleVideo() {
  const { mediaToken: pageMediaToken } = useParams<{ mediaToken: string }>();
  const { studioAccessCheck } = useSession();
  const [style, styleSet] = useState("anime_2d_flat");
  const [mediaToken, mediaTokenSet] = useState(pageMediaToken || "");
  const [IPAToken, IPATokenSet] = useState("");
  const [prompt, promptSet] = useState("");
  const [negativePrompt, negativePromptSet] = useState("");
  const [length, lengthSet] = useState(3000);
  const [useFaceDetailer, setUseFaceDetailer] = useState(false);
  const [useUpscaler, setUseUpscaler] = useState(false);
  const [useCinematic, setUseCinematic] = useState(false);
  const [enableLipsync, setEnableLipsync] = useState(false);
  const [strength, setStrength] = useState(1.0);
  const { enqueue } = useInferenceJobs();

  usePrefixedDocumentTitle("Style Video");

  const onClick = () => {
    if (mediaToken) {
      EnqueueVST("", {
        creator_set_visibility: "private",
        enable_lipsync: enableLipsync,
        ...(IPAToken ? { global_ipa_media_token: IPAToken } : {}),
        input_file: mediaToken,
        negative_prompt: negativePrompt,
        prompt,
        style,
        trim_end_millis: length,
        trim_start_millis: 0,
        use_face_detailer: useFaceDetailer,
        use_cinematic: useCinematic,
        use_upscaler: useUpscaler,
        use_strength: strength,
        uuid_idempotency_token: uuidv4(),
      }).then((res: EnqueueVSTResponse) => {
        if (res.success && res.inference_job_token) {
          enqueue(
            res.inference_job_token,
            FrontendInferenceJobType.VideoStyleTransfer,
            true
          );
        } else {
          console.log("Failed to enqueue job", res);
        }
      });
    }
  };

  const styleOptions = STYLE_OPTIONS.map(option => {
    return {
      label: option.label,
      value: option.value,
    };
  });

  const lengthOptions = [
    { label: "3 seconds", value: 3000 },
    { label: "5 seconds", value: 5000 },
    { label: "7 seconds", value: 7000 },
  ];

  return studioAccessCheck(
    <Container {...{ className: "fy-style-video-page mt-5", type: "panel" }}>
      <Panel {...{ padding: true }}>
        <header className="d-flex gap-3 flex-wrap">
          <h1 className="fw-semibold">Style a Video</h1>
        </header>
        <EntityInput
          {...{
            accept: ["video"],
            aspectRatio: "landscape",
            className: "fy-style-video-page-video-input",
            label: "Choose a video",
            name: "mediaToken",
            value: pageMediaToken,
            onChange: ({ target }: { target: any }) => {
              mediaTokenSet(target.value);
            },
            type: "media",
          }}
        />
        <div {...{ className: "prompt-row mt-3" }}>
          <div
            {...{
              className: "prompt-column",
            }}
          >
            <EntityInput
              {...{
                accept: ["image"],
                aspectRatio: "square",
                className: "fy-style-video-page-ipa-input",
                label: "IP Adapter Image",
                name: "IPAToken",
                value: IPAToken,
                onChange: ({ target }: { target: any }) => {
                  IPATokenSet(target.value);
                },
                type: "media",
              }}
            />
          </div>
          <div
            {...{
              className: "prompt-column flex-grow",
            }}
          >
            <Select
              {...{
                label: "Style",
                onChange: ({ target }: { target: any }) => {
                  styleSet(target.value);
                },
                options: styleOptions,
                value: style,
              }}
            />
            <div {...{ className: "prompt-row" }}>
              <TextArea
                {...{
                  label: "Positive prompt",
                  rows: 5,
                  onChange: ({ target }: { target: any }) => {
                    promptSet(target.value);
                  },
                }}
              />
              <TextArea
                {...{
                  label: "Negative prompt",
                  rows: 5,
                  onChange: ({ target }: { target: any }) => {
                    negativePromptSet(target.value);
                  },
                }}
              />
            </div>
          </div>
        </div>

        <h6>Strength ({strength})</h6>
        <div {...{ className: "prompt-row" }}>
          <Slider
            min={0.0}
            max={1.0}
            step={0.1}
            onChange={({ target }: { target: any }) => {
              setStrength(parseFloat(target.value));
            }}
            value={strength}
          />
        </div>

        <br />

        <h6>Quality Options</h6>
        <div {...{ className: "prompt-row" }}>
          <div className="form-check form-switch w-100">
            <input
              className="form-check-input"
              type="checkbox"
              id="useFaceDetailer"
              checked={useFaceDetailer}
              onChange={() => setUseFaceDetailer(!useFaceDetailer)}
            />
            <label className="form-check-label" htmlFor="useFaceDetailer">
              Use Face Detailer
            </label>
          </div>
        </div>
        <div {...{ className: "prompt-row" }}>
          <div className="form-check form-switch w-100">
            <input
              className="form-check-input"
              type="checkbox"
              id="useUpscaler"
              checked={useUpscaler}
              onChange={() => setUseUpscaler(!useUpscaler)}
            />
            <label className="form-check-label" htmlFor="useUpscaler">
              Use Upscaler
            </label>
          </div>
        </div>
        <div {...{ className: "prompt-row" }}>
          <div className="form-check form-switch w-100">
            <input
              className="form-check-input"
              type="checkbox"
              id="useCinematic"
              checked={useCinematic}
              onChange={() => setUseCinematic(!useCinematic)}
            />
            <label className="form-check-label" htmlFor="useCinematic">
              Use Cinematic
            </label>
          </div>
        </div>
        <div {...{ className: "prompt-row" }}>
          <div className="form-check form-switch w-100">
            <input
              className="form-check-input"
              type="checkbox"
              id="enableLipsync"
              checked={enableLipsync}
              onChange={() => setEnableLipsync(!enableLipsync)}
            />
            <label className="form-check-label" htmlFor="enableLipsync">
              Preserve Lip Movement
            </label>
          </div>
        </div>

        <br />

        <div {...{ className: "prompt-row" }}>
          <SegmentButtons
            {...{
              className: "fy-style-video-length",
              label: "Final video length",
              onChange: ({ target }: { target: any }) => {
                lengthSet(target.value);
              },
              options: lengthOptions,
              value: length,
            }}
          />
        </div>

        <div {...{ className: "d-flex justify-content-center mt-3" }}>
          <Button
            {...{
              disabled: !mediaToken,
              label: "Style",
              onClick,
              variant: "primary",
            }}
          />
        </div>
      </Panel>
    </Container>
  );
}
