import React, { useState } from "react";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import { useInferenceJobs, useModal, useSession } from "hooks";
import {
  Button,
  Container,
  Panel,
  SegmentButtons,
  TextArea,
  Slider,
  Label,
  DropdownOptions,
} from "components/common";
import { EntityInput } from "components/entities";
import {
  EnqueueVST,
  EnqueueVSTResponse,
} from "@storyteller/components/src/api/workflows/EnqueueVST";
import { Prompt } from "@storyteller/components/src/api/prompts/GetPrompts";
import { useParams } from "react-router-dom";
import { STYLE_OPTIONS, STYLES_BY_KEY } from "common/StyleOptions";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { StyleSelectionButton } from "./StyleSelection/StyleSelectionButton";
import useStyleStore from "hooks/useStyleStore";
import StyleOptionPicker from "./StyleSelection/StyleSelectionList";
import LoadingSpinner from "components/common/LoadingSpinner";
import { isMobile } from "react-device-detect";

export default function StyleVideo() {
  const { mediaToken: pageMediaToken } = useParams<{ mediaToken: string }>();
  const { loggedInOrModal, sessionFetched } = useSession();
  const [mediaToken, mediaTokenSet] = useState(pageMediaToken || "");
  const [IPAToken, IPATokenSet] = useState("");
  const [prompt, promptSet] = useState("");
  const [negativePrompt, negativePromptSet] = useState("");
  const [length, lengthSet] = useState(3000);
  const [useFaceDetailer, setUseFaceDetailer] = useState(true);
  const [useUpscaler, setUseUpscaler] = useState(false);
  const [useCinematic, setUseCinematic] = useState(true);
  const [enableLipsync, setEnableLipsync] = useState(false);
  const [strength, setStrength] = useState(1.0);
  const { enqueue } = useInferenceJobs();
  const { setSelectedStyle, setCurrentImage, selectedStyleValue } =
    useStyleStore();
  const { open, close } = useModal();
  const openModal = () =>
    open({
      component: StyleOptionPicker,
      props: {
        styleOptions: STYLE_OPTIONS,
        selectedStyle: selectedStyleValue,
        onStyleClick: handleStyleClick,
      },
    });

  usePrefixedDocumentTitle("Style Video");

  const onClick = () => {
    if (
      loggedInOrModal({
        loginMessage: "Login to finish your video",
        signupMessage: "Signup to finish your video",
      }) &&
      mediaToken
    ) {
      EnqueueVST("", {
        creator_set_visibility: "private",
        enable_lipsync: enableLipsync,
        ...(IPAToken ? { global_ipa_media_token: IPAToken } : {}),
        input_file: mediaToken,
        negative_prompt: negativePrompt,
        prompt,
        style: selectedStyleValue,
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

  const lengthOptions = [
    { label: "3 seconds", value: 3000 },
    { label: "5 seconds", value: 5000 },
    { label: "7 seconds", value: 7000 },
  ];

  const onPromptUpdate = (prompt: Prompt | null) => {
    promptSet(prompt?.maybe_positive_prompt || "");
    negativePromptSet(prompt?.maybe_negative_prompt || "");
    const styleOption = STYLES_BY_KEY.get(prompt?.maybe_style_name || "");
    if (styleOption) {
      setSelectedStyle(
        styleOption.value,
        styleOption.label,
        styleOption.image || ""
      );
    }
    IPATokenSet(prompt?.maybe_global_ipa_image_token || "");
    setStrength(prompt?.maybe_strength || 1.0);
    setUseFaceDetailer(!!prompt?.used_face_detailer);
    setUseUpscaler(!!prompt?.used_upscaler);
    setUseCinematic(!!prompt?.use_cinematic);
    setEnableLipsync(!!prompt?.lipsync_enabled);
  };

  const handleSliderChange = ({ target }: { target: any }) => {
    setStrength(parseFloat(target.value));
  };

  const vstInfo = (
    <div className="d-flex gap-3 justify-content-center">
      <div>
        <div
          className="overflow-hidden"
          style={{
            maxHeight: "250px",
            height: "100%",
          }}
        >
          {!isMobile ? (
            <video
              preload="metadata"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
                overflow: "hidden",
              }}
              autoPlay={true}
              controls={false}
              muted={true}
              loop={true}
              playsInline={true}
            >
              <source src="/videos/vst_banner_desktop.mp4" type="video/mp4" />
            </video>
          ) : (
            <video
              preload="metadata"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
                overflow: "hidden",
              }}
              autoPlay={true}
              controls={false}
              muted={true}
              loop={true}
              playsInline={true}
              className="px-2"
            >
              <source src="/videos/vst_banner_mobile.mp4" type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </div>
  );

  const handleStyleClick = (style: string, label: string, image: string) => {
    setSelectedStyle(style, label);
    setCurrentImage(image);
    close();
  };

  if (!sessionFetched) {
    return (
      <Container
        type="panel"
        className="narrow-container"
        style={{ height: "calc(100vh - 65px)" }}
      >
        <div className="d-flex align-items-center justify-content-center h-100 gap-4">
          <LoadingSpinner
            label="Loading"
            className="me-3 fs-6"
            labelClassName="fs-4"
          />
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-3" type="panel">
        <Panel className="d-block d-lg-none mb-3">{vstInfo}</Panel>
        <div className="row flex-lg-row-reverse g-3">
          <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column gap-3">
            <Panel className="d-none d-lg-block">{vstInfo}</Panel>

            <Panel padding={true} className="h-auto">
              <h2 className="fw-bold mb-3 d-block d-lg-none">Style a Video</h2>
              <div className="d-flex align-items-center">
                {!mediaToken && (
                  <div className="mb-2">
                    <div className="focus-point" />
                  </div>
                )}
                <Label label="Choose a Video" />
              </div>

              <div
                style={{
                  height: "calc(100vh - 250px - 65px - 240px)",
                  minHeight: "400px",
                }}
              >
                <EntityInput
                  {...{
                    accept: ["video"],
                    aspectRatio: "landscape",
                    name: "mediaToken",
                    className: "h-100",
                    value: mediaToken,
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
            <Panel padding={true}>
              <div className="d-flex flex-column">
                <h2 className="fw-bold mb-3 d-none d-lg-block">
                  Style a Video
                </h2>
                <div>
                  <StyleSelectionButton onClick={openModal} className="mb-3" />
                  <div>
                    <TextArea
                      {...{
                        label: "Text Prompt",
                        placeholder: "Describe your video here...",
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
                          label: "Negative Prompt",
                          placeholder:
                            "Type what you don't want in your video...",
                          rows: 1,
                          onChange: ({ target }: { target: any }) => {
                            negativePromptSet(target.value);
                          },
                        }}
                      />
                    </DropdownOptions>
                  </div>
                </div>

                <h6 className="mt-4">
                  Style Strength ({Math.round(strength * 100)}%)
                </h6>
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
                    <div className="w-100 mt-3">
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
                      highlight: true,
                    }}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </div>
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
