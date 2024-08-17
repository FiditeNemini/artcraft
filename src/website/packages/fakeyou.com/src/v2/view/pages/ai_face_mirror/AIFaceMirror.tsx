import React, { useState } from "react";
import {
  Button,
  Container,
  Panel,
  Checkbox,
  TempSelect as Select,
  // SegmentButtons,
  // TextArea,
  // Slider,
  Label,
  SessionFetchingSpinner,
  LoginBlock,
  // DropdownOptions,
} from "components/common";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import {
  MediaFileCropArea,
  EnqueueFaceMirror,
  EnqueueFaceMirrorResponse,
} from "@storyteller/components/src/api/workflows/EnqueueFaceMirror";
import { EntityInput } from "components/entities";
import {
  useInferenceJobs,
  useSession,
  // useSession
} from "hooks";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./AIFaceMirror.scss";
import { AITools } from "components/marketing";
import { useDocumentTitle } from "@storyteller/components/src/hooks/UseDocumentTitle";

interface Props {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function AIFaceMirror({ sessionSubscriptionsWrapper }: Props) {
  const { loggedIn, sessionFetched } = useSession();
  const [sourceMediaToken, sourceMediaTokenSet] = useState("");
  const [removeWatermark, removeWatermarkSet] = useState(false);
  const [faceDriverToken, faceDriverTokenSet] = useState(
    "m_41caq6n7nw15y9e68009bgkn23m3yf"
  );
  const [visibility, visibilitySet] = useState<"private" | "public">("public");
  const [cropArea, cropAreaSet] = useState<MediaFileCropArea>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  useDocumentTitle("Live Portrait AI. Free Video Animation");

  const { enqueue } = useInferenceJobs();

  const visibilityOptions = [
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
  ];

  const hasTokens = !!sourceMediaToken && !!faceDriverToken;

  const hasPremium = sessionSubscriptionsWrapper.hasPaidFeatures();

  const enqueueClick = () => {
    if (hasTokens) {
      EnqueueFaceMirror("", {
        creator_set_visibility: visibility,
        face_driver_media_file_token: faceDriverToken,
        maybe_crop: cropArea,
        remove_watermark: removeWatermark,
        source_media_file_token: sourceMediaToken,
        uuid_idempotency_token: uuidv4(),
      }).then((res: EnqueueFaceMirrorResponse) => {
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

  if (!sessionFetched) {
    return <SessionFetchingSpinner />;
  }

  if (!loggedIn) {
    return (
      <LoginBlock
        title="You need to be logged in to use Live Portrait"
        redirect="/ai-live-portrait"
      />
    );
  }

  return (
    <>
      <Container type="panel" className="mt-3">
        <Panel {...{ className: "fy-ai-face-mirror-panel" }}>
          <header {...{ className: "fy-ai-face-mirror-header" }}>
            <video
              {...{
                autoPlay: true,
                muted: true,
                loop: true,
                playsInline: true,
              }}
            >
              <source src="/videos/motion_mirror_bg_04.mp4" type="video/mp4" />
            </video>
            <div {...{ className: "fy-ai-face-mirror-header-content" }}>
              <div {...{ className: "fy-ai-face-mirror-title" }}>
                <h1 className="fw-bold">Live Portrait</h1>
                <p>
                  Use AI to transfer facial expressions, audio, and vocals from
                  one face video to an image or a video
                </p>
              </div>
            </div>
          </header>
          <div
            {...{
              className: "fy-ai-face-mirror-main-inputs",
            }}
          >
            <div
              {...{
                className: "fy-ai-face-mirror-column",
              }}
            >
              <Label label="Choose a portrait video or image" />
              <EntityInput
                {...{
                  accept: ["video", "image"],
                  // aspectRatio: "landscape",
                  name: "mediaToken",
                  value: sourceMediaToken,
                  onChange: ({ target }: { target: any }) => {
                    sourceMediaTokenSet(target.value);
                  },
                  type: "media",
                }}
              />
            </div>
            <div
              {...{
                className: "fy-ai-face-mirror-column",
              }}
            >
              <Label label="Then choose a motion reference" />
              <EntityInput
                {...{
                  accept: ["video"],
                  cropProps: {
                    aspect: 1,
                    onCropComplete: (croppedArea, croppedAreaPixels) => {
                      cropAreaSet(croppedAreaPixels);
                    },
                  },
                  // aspectRatio: "landscape",
                  // debug: "AFM driver input",
                  name: "faceDriverToken",
                  value: faceDriverToken,
                  onChange: ({ target }: { target: any }) => {
                    faceDriverTokenSet(target.value);
                  },
                  type: "media",
                }}
              />
            </div>
          </div>
          <div
            {...{
              className: "fy-ai-face-mirror-secondary-inputs",
            }}
          >
            <fieldset {...{ className: "input-block" }}>
              <Select
                {...{
                  label: "Visibility",
                  onChange: ({ target }: any) => {
                    visibilitySet(target.value);
                  },
                  options: visibilityOptions,
                  value: visibility,
                }}
              />
            </fieldset>
            <fieldset {...{ className: "input-block" }}>
              <div {...{ className: "fy-ai-face-mirror-premium-label" }}>
                Watermark
                {!hasPremium ? (
                  <Link {...{ to: "pricing" }}>subscribe to remove</Link>
                ) : null}
              </div>

              <Checkbox
                {...{
                  disabled: !hasPremium,
                  label: "Remove",
                  onChange: ({ target }: any) => {
                    removeWatermarkSet(target.value);
                  },
                }}
              />
            </fieldset>
            <Button
              {...{
                disabled: !hasTokens,
                label: "Create",
                onClick: enqueueClick,
              }}
            />
          </div>
        </Panel>
      </Container>

      <Container type="panel" className="pt-5 mt-5">
        <Panel clear={true}>
          <h2 className="fw-bold mb-3">Try other AI video tools</h2>
          <AITools />
        </Panel>
        {/* <MentionsSection /> */}
        {/* <StorytellerStudioCTA /> */}
      </Container>
    </>
  );
}
