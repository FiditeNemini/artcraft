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
  Label,
  DropdownOptions,
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
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";

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
  const [useCinematic, setUseCinematic] = useState(true);
  const [enableLipsync, setEnableLipsync] = useState(false);
  const [strength, setStrength] = useState(1.0);
  const [visualStrength, setVisualStrength] = useState(100);
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

  const handleSliderChange = ({ target }: { target: any }) => {
    const decimalValue = parseFloat(target.value);
    const visualValue = Math.round(decimalValue * 100);
    setStrength(decimalValue);
    setVisualStrength(visualValue);
  };

  const storytellerCTA = (
    <div className="row g-2 g-md-4">
      <div className="col-12 col-md-4">
        <div
          className="overflow-hidden"
          style={{
            height: "20vh",
            borderRadius: "0.5rem 0rem 0rem 0.5rem",
          }}
        >
          <video
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              overflow: "hidden",
            }}
            autoPlay={true}
            controls={false}
            muted={true}
            loop={true}
            playsInline={true}
          >
            <source
              src="/videos/landing/hero_landing_video.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
      <div className="col-12 col-md-8">
        <div className="d-flex flex-column justify-content-center h-100 w-100 p-3">
          <h3 className="fw-semibold">
            If you like AI Video, you'll love Storyteller Studio!
          </h3>
          <p className="opacity-75">
            Our AI creation engine lets you create videos from scratch. Build
            simple scenes, and turn them into incredible visuals!
          </p>
          <div className="mt-3 d-flex">
            <Button
              icon={faArrowRight}
              iconFlip={true}
              label="Go to Storyteller"
              small={true}
              href="https://storyteller.ai/"
              variant="action"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return studioAccessCheck(
    <>
      <Container className="mt-3">
        <div className="row flex-lg-row-reverse g-3">
          <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column gap-3">
            <Panel className="rounded d-none d-lg-block">
              {storytellerCTA}
            </Panel>

            <Panel padding={true} className="rounded h-auto">
              <h2 className="fw-bold mb-3 d-block d-lg-none">Style a Video</h2>
              <Label label="Choose a Video" />
              <div style={{ height: "calc(100vh - 20vh - 65px - 250px)" }}>
                <EntityInput
                  {...{
                    accept: ["video"],
                    aspectRatio: "landscape",
                    name: "mediaToken",
                    className: "h-100",
                    value: pageMediaToken,
                    onPromptUpdate,
                    onChange: ({ target }: { target: any }) => {
                      mediaTokenSet(target.value);
                    },
                    type: "media",
                  }}
                />
              </div>
            </Panel>

            <div className="d-none d-lg-flex justify-content-center w-100 mt-3">
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
          <div className="col-12 col-lg-4 col-xl-3">
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
                    <DropdownOptions
                      title="Show Negative Prompt"
                      closeTitle="Hide Negative Prompt"
                    >
                      <TextArea
                        {...{
                          label: "Negative prompt",
                          rows: 1,
                          onChange: ({ target }: { target: any }) => {
                            negativePromptSet(target.value);
                          },
                        }}
                      />
                    </DropdownOptions>
                  </div>
                </div>
                <div className="mt-3 w-100">
                  <EntityInput
                    {...{
                      accept: ["image"],
                      aspectRatio: "square",
                      className: "w-100",
                      label: "Additional Style Reference Image (Optional)",
                      name: "IPAToken",
                      value: IPAToken,
                      onChange: ({ target }: { target: any }) => {
                        IPATokenSet(target.value);
                      },
                      type: "media",
                    }}
                  />
                </div>
                <h6 className="mt-4">Style Strength ({visualStrength}%)</h6>
                <div className="w-100">
                  <Slider
                    min={0.0}
                    max={1.0}
                    step={0.01}
                    onChange={handleSliderChange}
                    value={strength}
                    className="w-100"
                  />
                </div>

                <div className="mt-3">
                  <DropdownOptions>
                    <div>
                      <h6 className="pb-2">Quality Options</h6>
                      <div>
                        <div className="form-check form-switch w-100">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="useFaceDetailer"
                            checked={useFaceDetailer}
                            onChange={() =>
                              setUseFaceDetailer(!useFaceDetailer)
                            }
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
                          <label
                            className="form-check-label"
                            htmlFor="useUpscaler"
                          >
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
                          <label
                            className="form-check-label"
                            htmlFor="useCinematic"
                          >
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
                          <label
                            className="form-check-label"
                            htmlFor="enableLipsync"
                          >
                            Preserve Lip Movement
                          </label>
                        </div>
                      </div>
                    </div>
                  </DropdownOptions>
                </div>

                <div className="mt-4">
                  <SegmentButtons
                    {...{
                      className: "fy-style-video-length",
                      label: "Video Duration",
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
        <Panel className="rounded d-block d-lg-none mt-5">
          {storytellerCTA}
        </Panel>
      </Container>

      <div
        className="d-flex d-lg-none justify-content-center w-100 mt-5 position-fixed bottom-0 p-3 bg-panel"
        style={{ zIndex: 3 }}
      >
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
