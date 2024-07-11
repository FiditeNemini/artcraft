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
import { Prompt } from "@storyteller/components/src/api/prompts/GetPrompts";
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

  const onPromptUpdate = (prompt: Prompt | null) => {
    promptSet(prompt?.maybe_positive_prompt || "");
    negativePromptSet(prompt?.maybe_negative_prompt || "");
    styleSet(prompt?.maybe_style_name || "");
    IPATokenSet(prompt?.maybe_global_ipa_image_token || "");
    setStrength(prompt?.maybe_strength || 1.0);
    setUseFaceDetailer(!!prompt?.used_face_detailer);
    setUseUpscaler(!!prompt?.used_upscaler);
    setUseCinematic(!!prompt?.use_cinematic);
    setEnableLipsync(!!prompt?.lipsync_enabled);
  };

  return studioAccessCheck(
    <>
      <Container className="mt-3">
        <div className="row flex-lg-row-reverse g-3">
          <div className="col-12 col-lg-7 col-xl-9">
            <Panel padding={true} className="rounded">
              <h2 className="fw-bold mb-3 d-block d-lg-none">Style a Video</h2>
              <EntityInput
                {...{
                  accept: ["video"],
                  aspectRatio: "landscape",
                  className: "fy-style-video-page-video-input",
                  label: "Choose a video",
                  name: "mediaToken",
                  value: pageMediaToken,
                  onPromptUpdate,
                  onChange: ({ target }: { target: any }) => {
                    mediaTokenSet(target.value);
                  },
                  type: "media",
                }}
              />
            </Panel>
            <div className="d-none d-lg-flex justify-content-center w-100 mt-5">
              <Button
                {...{
                  disabled: !mediaToken,
                  label: "Generate Styled Video",
                  onClick,
                  variant: "primary",
                  className: "px-5",
                }}
              />
            </div>
          </div>
          <div className="col-12 col-lg-5 col-xl-3">
            <Panel padding={true} className="rounded">
              <div className="d-flex flex-column">
                <h2 className="fw-bold mb-3 d-none d-lg-block">
                  Style a Video
                </h2>
                <div>
                  <Select
                    {...{
                      label: "Choose a Style",
                      onChange: ({ target }: { target: any }) => {
                        styleSet(target.value);
                      },
                      options: styleOptions,
                      value: style,
                    }}
                  />
                  <div>
                    <TextArea
                      {...{
                        label: "Positive prompt",
                        rows: 2,
                        onChange: ({ target }: { target: any }) => {
                          promptSet(target.value);
                        },
                        value: prompt,
                      }}
                    />
                    <TextArea
                      {...{
                        label: "Negative prompt",
                        rows: 1,
                        onChange: ({ target }: { target: any }) => {
                          negativePromptSet(target.value);
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="mt-3 w-100">
                  <EntityInput
                    {...{
                      accept: ["image"],
                      aspectRatio: "square",
                      className: "w-100",
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
                <h6 className="mt-4">Strength ({strength})</h6>
                <div className="w-100">
                  <Slider
                    min={0.0}
                    max={1.0}
                    step={0.1}
                    onChange={({ target }: { target: any }) => {
                      setStrength(parseFloat(target.value));
                    }}
                    value={strength}
                    className="w-100"
                  />
                </div>
                <h6 className="mt-3 pb-2">Quality Options</h6>
                <div>
                  <div className="form-check form-switch w-100">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="useFaceDetailer"
                      checked={useFaceDetailer}
                      onChange={() => setUseFaceDetailer(!useFaceDetailer)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="useFaceDetailer"
                    >
                      Use Face Detailer
                    </label>
                  </div>
                </div>
                <div>
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
                <div>
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
                <div>
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
                <div>
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
              </div>
            </Panel>
          </div>
        </div>
      </Container>
      <div className="d-flex d-lg-none justify-content-center w-100 mt-5 position-fixed bottom-0 p-3 bg-panel">
        <Button
          {...{
            disabled: !mediaToken,
            label: "Generate Styled Video",
            onClick,
            variant: "primary",
            className: "px-5 w-100",
          }}
        />
      </div>
    </>
  );
}
