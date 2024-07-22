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
  // DropdownOptions,
} from "components/common";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import {
  EnqueueActingFace,
  EnqueueActingFaceResponse,
} from "@storyteller/components/src/api/workflows/EnqueueActingFace";
import { EntityInput } from "components/entities";
import {
  useInferenceJobs,
  // useSession
} from "hooks";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./AIFaceMirror.scss";

interface Props {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function AIFaceMirror({ sessionSubscriptionsWrapper }: Props) {
  const [sourceMediaToken, sourceMediaTokenSet] = useState("");
  const [removeWatermark, removeWatermarkSet] = useState(false);
  const [faceDriverToken, faceDriverTokenSet] = useState(
    "m_41caq6n7nw15y9e68009bgkn23m3yf"
  );
  const [visibility, visibilitySet] = useState<"private" | "public">("public");
  const { enqueue } = useInferenceJobs();
  // const { canBanUsers } = useSession();

  const visibilityOptions = [
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
  ];

  const hasTokens = !!sourceMediaToken && !!faceDriverToken;

  const hasPremium = sessionSubscriptionsWrapper.hasPaidFeatures();

  const enqueueClick = () => {
    if (hasTokens) {
      EnqueueActingFace("", {
        creator_set_visibility: visibility,
        face_driver_media_file_token: faceDriverToken,
        remove_watermark: removeWatermark,
        source_media_file_token: sourceMediaToken,
        uuid_idempotency_token: uuidv4(),
      }).then((res: EnqueueActingFaceResponse) => {
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

  return (
    <Container className="mt-3">
      <Panel {...{ className: "fy-ai-face-mirror-panel" }}>
        <header {...{ className: "fy-ai-face-mirror-header" }}>
          <video autoPlay muted loop id="myVideo">
            <source src="/videos/motion_mirror_bg_04.mp4" type="video/mp4" />
          </video>
          <div {...{ className: "fy-ai-face-mirror-header-content" }}>
            <div {...{ className: "fy-ai-face-mirror-title" }}>
              <h1>AI Face Mirror</h1>
              <p>
                Use AI to transfer motion from one face video to another
                portrait image or video.
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
  );
}
