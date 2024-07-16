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

import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import {
  EnqueueActingFace,
  EnqueueActingFaceResponse,
} from "@storyteller/components/src/api/workflows/EnqueueActingFace";
import { EntityInput } from "components/entities";
import { useInferenceJobs, useSession } from "hooks";

import { v4 as uuidv4 } from "uuid";
import "./ActingFace.scss";

interface Props {
  value?: any;
}

export default function ActingFace({ value }: Props) {
  const [sourceMediaToken, sourceMediaTokenSet] = useState("");
  const [removeWatermark, removeWatermarkSet] = useState(false);
  const [faceDriverToken, faceDriverTokenSet] = useState(
    "m_g6adxppds5cgg02fjva3253ttp2c5r"
  );
  const [visibility, visibilitySet] = useState<"private" | "public">("private");
  const { enqueue } = useInferenceJobs();
  const { canBanUsers } = useSession();

  const visibilityOptions = [
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
  ];

  const hasTokens = sourceMediaToken && faceDriverToken;

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

  return canBanUsers() ? (
    <Container className="mt-3">
      <Panel className="p-3">
        <header {...{ className: "fy-live-portrait-header" }}>
          <h2 className="">Acting Face</h2>
          <Button
            {...{
              disabled: !hasTokens,
              label: "Create",
              onClick: enqueueClick,
            }}
          />
        </header>
        <div
          {...{
            className: "fy-live-portrait-inputs",
          }}
        >
          <div
            {...{
              className: "fy-live-portrait-column",
            }}
          >
            <Label label="Choose a portrait video or image" />
            <EntityInput
              {...{
                accept: ["video", "image"],
                aspectRatio: "landscape",
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
              className: "fy-live-portrait-column",
            }}
          >
            <Label label="Then choose a motion reference" />
            <EntityInput
              {...{
                accept: ["video"],
                aspectRatio: "landscape",
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
        <Checkbox
          {...{
            label: "Remove watermark",
            onChange: ({ target }: any) => {
              removeWatermarkSet(target.value);
            },
          }}
        />
        <Select
          {...{
            label: "visibility",
            onChange: ({ target }: any) => {
              visibilitySet(target.value);
            },
            options: visibilityOptions,
            value: visibility,
          }}
        />
      </Panel>
    </Container>
  ) : null;
}
