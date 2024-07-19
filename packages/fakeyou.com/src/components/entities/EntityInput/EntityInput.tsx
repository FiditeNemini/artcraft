import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import Iframe from "react-iframe";
import { Button, Label, Spinner } from "components/common";
import {
  AcceptTypes,
  EntityModeProp,
  mediaCategoryfromString,
  MediaFilters,
  UploaderResponse,
} from "components/entities/EntityTypes";
import { useMedia, useMediaUploader } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Prompt } from "@storyteller/components/src/api/prompts/GetPrompts";
import EntityInputEmpty from "./EntityInputEmpty";
import "./EntityInput.scss";

interface EntityInputProps {
  accept?: AcceptTypes | AcceptTypes[];
  aspectRatio?: "square" | "landscape" | "portrait";
  className?: string;
  debug?: string;
  label?: string;
  name?: string;
  onChange?: any;
  onPromptUpdate?: (prompt: Prompt | null) => void;
  type: EntityModeProp;
  value?: string;
}

export interface SlideProps {
  media?: MediaFile;
  clear: () => void;
}

interface AniProps {
  animating: boolean;
  className: string;
  isLeaving: boolean;
  render: any;
  style: any;
}

const MediaBusy = () => {
  return <Spinner />;
};

const EntityInputFull = ({ media, clear }: SlideProps) => {
  const bucketConfig = new BucketConfig();
  const mediaUrl = media?.public_bucket_path
    ? bucketConfig.getGcsUrl(media.public_bucket_path)
    : "";
  const mediaType = mediaCategoryfromString(media?.media_type || "");
  const uploader = `Uploaded by ${
    media?.maybe_creator_user?.display_name || "User"
  }`;

  switch (mediaType) {
    case MediaFilters.image:
      return (
        <>
          <img {...{ src: mediaUrl, alt: "Selected media file" }} />
          <div {...{ className: "fy-entity-input-full-controls" }}>
            <div {...{ className: "fy-entity-input-file-details" }}>
              {media?.maybe_title || "Untitled image"}
              <div>{uploader}</div>
            </div>
            <Button
              {...{
                label: "Clear",
                variant: "secondary",
                onClick: () => clear(),
              }}
            />
          </div>
        </>
      );
    case MediaFilters.video:
      return (
        <>
          <video controls {...{ src: mediaUrl }} />
          <div {...{ className: "fy-entity-input-full-controls" }}>
            <div {...{ className: "fy-entity-input-file-details" }}>
              {media?.maybe_title || "Untitled video"}
              <div>{uploader}</div>
            </div>
            <Button
              {...{
                label: "Clear",
                variant: "secondary",
                onClick: () => clear(),
              }}
            />
          </div>
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
          <div {...{ className: "fy-entity-input-full-controls" }}>
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
  aspectRatio = "square",
  className,
  debug,
  label,
  name = "",
  onChange,
  onPromptUpdate,
  type,
  value,
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
  const clear = () => {
    mediaSet(undefined);
    mediaTokenSet("");
  };

  const selectToken = (token: string) => {
    mediaTokenSet(token);
    onChange({ target: { name, value: token } });
  };

  const { busy: uploaderBusy, inputProps } = useMediaUploader({
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
  const index = busy ? 0 : media ? 1 : 2;
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
          className: `fy-entity-input panel-inner${
            aspectRatio ? " fy-entity-input-" + aspectRatio : ""
          }${className ? " " + className : ""}`,
        }}
      >
        {transitions((style: any, i: number, state: any) => {
          let isLeaving = state.phase === "leave";
          let sharedProps = { animating, isLeaving, style };

          return [
            <AnimatedSlide
              {...{
                className:
                  "fy-entity-input-busy d-flex justify-content-center align-items-center",
                render: MediaBusy,
                ...sharedProps,
              }}
            />,
            <AnimatedSlide
              {...{
                className: "fy-entity-input-full",
                clear,
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
                type,
                ...sharedProps,
                ...rest,
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
