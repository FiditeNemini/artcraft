import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import useMeasure from "react-use-measure";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import Iframe from "react-iframe";
import { Area, Point } from "react-easy-crop";
import {
  Button,
  Label,
  Spinner,
  ZoomSliderOnChangeEvent,
} from "components/common";
import {
  AcceptTypes,
  EntityModeProp,
  mediaCategoryfromString,
  MediaFilters,
  UploaderResponse,
} from "components/entities/EntityTypes";
import { WorkIndicator } from "components/svg";
import { useMedia, useMediaUploader } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Prompt } from "@storyteller/components/src/api/prompts/GetPrompts";
import EntityInputEmpty from "./EntityInputEmpty";
import EntityInputSidePanel from "./EntityInputSidePanel";
import EntityInputImageVideoPreview from "./EntityInputImageVideoPreview";
import "./EntityInput.scss";

export type OnCropComplete = (
  croppedArea: Area,
  croppedAreaPixels: Area
) => void;

export interface CropProps {
  aspect: number;
  onCropComplete?: OnCropComplete;
}

interface EntityInputProps {
  accept?: AcceptTypes | AcceptTypes[];
  // aspectRatio?: "square" | "landscape" | "portrait";
  className?: string;
  cropProps?: CropProps;
  debug?: string;
  label?: string;
  name?: string;
  onChange?: any;
  onPromptUpdate?: (prompt: Prompt | null) => void;
  showWebcam?: boolean;
  type: EntityModeProp;
  value?: string;
  showMediaBrowserFilters?: boolean;
}

export interface SlideProps {
  clear: () => void;
  cropProps?: CropProps;
  isNarrow: boolean;
  media?: MediaFile;
  resetUploader: () => void;
  uploaderBusy: boolean;
  uploadProgress: number;
}

interface AniProps {
  animating: boolean;
  className: string;
  isLeaving: boolean;
  onCropComplete?: OnCropComplete;
  render: any;
  style: any;
}

const MediaError = ({ resetUploader }: SlideProps) => {
  return (
    <>
      <h4>There was a problem with your upload</h4>
      <Button
        {...{
          label: "Try another upload",
          onClick: resetUploader,
          variant: "secondary",
        }}
      />
    </>
  );
};

const MediaBusy = ({ uploaderBusy, uploadProgress }: SlideProps) => {
  return (
    <div {...{ className: "fy-entity-input-loader" }}>
      {uploaderBusy ? (
        <WorkIndicator
          {...{
            failure: false,
            label: "Uploading",
            max: 100,
            progressPercentage: uploadProgress,
            stage: 1,
            showPercentage: true,
            success: false,
          }}
        />
      ) : (
        <Spinner />
      )}
    </div>
  );
};

const EntityInputFull = ({ clear, cropProps, isNarrow, media }: SlideProps) => {
  const bucketConfig = new BucketConfig();
  const mediaUrl = media?.public_bucket_path
    ? bucketConfig.getGcsUrl(media.public_bucket_path)
    : "";
  const mediaType = mediaCategoryfromString(media?.media_type || "");

  const [crop, cropSet] = useState<Point>({ x: 0, y: 0 });
  const [zoom, zoomSet] = useState(1);

  const zoomSliderChange = ({ target }: ZoomSliderOnChangeEvent) =>
    zoomSet(target.value);

  switch (mediaType) {
    case MediaFilters.image:
      return (
        <>
          <EntityInputImageVideoPreview
            {...{
              crop,
              cropProps,
              cropSet,
              image: mediaUrl,
              zoom,
              zoomSet,
            }}
          />
          <EntityInputSidePanel
            {...{
              clear,
              entityType: "image",
              isNarrow,
              media,
              showCrop: !!cropProps,
              zoomSliderChange,
              zoom,
            }}
          />
        </>
      );
    case MediaFilters.video:
      return (
        <>
          <EntityInputImageVideoPreview
            {...{
              crop,
              cropProps,
              cropSet,
              video: mediaUrl,
              zoom,
              zoomSet,
            }}
          />
          <EntityInputSidePanel
            {...{
              clear,
              entityType: "video",
              isNarrow,
              media,
              showCrop: !!cropProps,
              zoomSliderChange,
              zoom,
            }}
          />
        </>
      );
    case MediaFilters.engine_asset:
      return (
        <>
          <Iframe
            {...{
              url: `https://engine.fakeyou.com?mode=viewer&${media?.media_type}=${mediaUrl}`,
              className: "fy-entity-input-mocap-preview",
            }}
          />
          <div {...{ className: ".fy-entity-input-preview-info" }}>
            Your file
          </div>
        </>
      );
    default:
      return <div>Unknown media type</div>;
  }
};

const AnimatedSlide = ({
  animating,
  className,
  isLeaving,
  render: Render,
  style,
  ...rest
}: AniProps) => (
  <a.div
    {...{
      className: `fy-slide-frame${className ? " " + className : ""}`,
      style,
    }}
  >
    <Render {...{ ...rest, animating }} />
  </a.div>
);

export default function EntityInput({
  accept,
  className,
  cropProps,
  debug,
  label,
  name = "",
  onChange,
  onPromptUpdate,
  showWebcam = true,
  type,
  value,
  showMediaBrowserFilters,
  ...rest
}: EntityInputProps) {
  const { search } = useLocation();
  const urlSearch = new URLSearchParams(search);
  const presetToken = search ? urlSearch.get("preset_token") : "";
  const queryUser = search ? urlSearch.get("query_user") : "";
  const [mediaToken, mediaTokenSet] = useState(presetToken || value || "");
  const {
    busy: mediaBusy,
    media,
    mediaSet,
    prompt,
    reload,
  } = useMedia({
    debug,
    mediaToken: mediaToken || value,
  });
  const [updated, updatedSet] = useState(false);
  const [outerRef, { width }] = useMeasure();

  const isNarrow = (width || 0) <= 480;

  const clear = () => {
    mediaSet(undefined);
    mediaTokenSet("");
    onChange({ target: { name, value: "" } });
  };

  const selectToken = (token: string) => {
    mediaTokenSet(token);
    onChange({ target: { name, value: token } });
  };

  const {
    busy: uploaderBusy,
    error: uploaderError,
    inputProps,
    uploadProgress,
    reset: resetUploader,
  } = useMediaUploader({
    autoUpload: true,
    onSuccess: (res: UploaderResponse) => {
      reload();
      selectToken(res.media_file_token);
    },
  });

  const onSelect = (data: MediaFile) => {
    mediaSet(data);
    selectToken(data.token);
  };

  const busy = mediaBusy || uploaderBusy;
  const index = uploaderError ? 3 : busy ? 0 : media ? 1 : 2;
  const [animating, animatingSet] = useState(false);

  if (debug)
    console.log(`🐞 EntityInput Debug at ${debug}`, {
      index,
      busy,
      media,
      view: ["busy slide", "full slide", "empty slide"][index],
    });

  const transitions = useTransition(index, {
    config: { mass: 1, tension: 80, friction: 10 },
    from: { opacity: 0, transform: `translateX(${5}rem)` },
    enter: { opacity: 1, transform: `translateX(0)` },
    leave: { opacity: 0, transform: `translateX(${5}rem)` },
    onRest: () => animatingSet(false),
    onStart: () => animatingSet(true),
  });

  useEffect(() => {
    if (onPromptUpdate) {
      if (prompt && !updated) {
        updatedSet(true);
        onPromptUpdate(prompt);
      } else if (!prompt && updated) {
        updatedSet(false);
        onPromptUpdate(null);
      }
    }

    if (presetToken && value !== presetToken) {
      onChange({ target: { name, value: presetToken } });
    }
  }, [presetToken, prompt, name, onChange, onPromptUpdate, updated, value]);

  return (
    <>
      <Label {...{ label }} />
      <div
        {...{
          className: `fy-entity-input ${className ? " " + className : ""}${
            isNarrow ? " fy-entity-input-narrow" : " fy-entity-input-wide"
          }`,
          ref: outerRef,
        }}
      >
        {transitions((style: any, i: number, state: any) => {
          let isLeaving = state.phase === "leave";
          let sharedProps = {
            animating,
            isLeaving,
            style,
            showFilters: showMediaBrowserFilters,
            uploaderBusy,
          };

          return [
            <AnimatedSlide
              {...{
                className:
                  "fy-entity-input-busy d-flex justify-content-center align-items-center",
                render: MediaBusy,
                uploadProgress,
                ...sharedProps,
              }}
            />,
            <AnimatedSlide
              {...{
                className: "fy-entity-input-full",
                clear,
                cropProps,
                isNarrow,
                media,
                render: EntityInputFull,
                ...sharedProps,
              }}
            />,
            <AnimatedSlide
              {...{
                accept,
                className: "fy-entity-input-empty",
                inputProps,
                onSelect,
                queryUser,
                render: EntityInputEmpty,
                selectToken,
                showWebcam,
                type,
                ...sharedProps,
                ...rest,
              }}
            />,
            <AnimatedSlide
              {...{
                className: "fy-entity-input-error",
                render: MediaError,
                resetUploader,
                ...sharedProps,
              }}
            />,
          ][i];
        })}
      </div>
    </>
  );
}

// const handleTargetChange = (ev: React.FormEvent<HTMLSelectElement>) => {
//   const value = (ev.target as HTMLSelectElement).value;
//   setTarget(value);
// };
