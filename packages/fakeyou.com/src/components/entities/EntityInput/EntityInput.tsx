import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import Iframe from "react-iframe";
import { Button, Label, Spinner } from "components/common";
import { AcceptTypes, EntityModeProp, mediaCategoryfromString, MediaFilters, UploaderResponse } from "components/entities/EntityTypes";
import { useMedia, useMediaUploader } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import EntityInputEmpty from "./EntityInputEmpty";
import "./EntityInput.scss";

interface Props {
  accept?: AcceptTypes | AcceptTypes[],
  aspectRatio?: "square" | "landscape" | "portrait",
  label?: string,
  name?: string,
  onChange?: any,
  type: EntityModeProp,
  value?: string
}

export interface SlideProps {
  media?: MediaFile,
  clear: () => void
};

interface AniProps {
  animating: boolean,
  className: string,
  isLeaving: boolean,
  render: any,
  style: any
}

const MediaBusy = () => {
  return <Spinner/>;
};

const EntityInputFull = ({ media, clear }: SlideProps) => {
  const bucketConfig = new BucketConfig();
  const mediaUrl = media?.public_bucket_path ? bucketConfig.getGcsUrl(media.public_bucket_path) : "";
  const mediaType = mediaCategoryfromString(media?.media_type || "");

  switch (mediaType) {
    case MediaFilters.image: return <img {...{ src: mediaUrl, alt: "Selected media file" }}/>
    case MediaFilters.video: return <>
      <video controls {...{ src: mediaUrl }}/>
      <div {...{ className: "fy-entity-input-full-controls" }}>
        Your file
        <Button {...{ label: "Clear", variant: "secondary", onClick: () => clear() }}/>
      </div>
    </>;
    case MediaFilters.engine_asset: return <>
      <Iframe
          {...{
            url: `https://engine.fakeyou.com?mode=viewer&${media?.media_type}=${mediaUrl}`,
            className: "fy-entity-input-mocap-preview",
          }}
        />
      <div {...{ className: "fy-entity-input-full-controls" }}>
        Your file
      </div>
    </>;
    default: return <div>Unknown media type</div>;
  }
};

const AnimatedSlide = ({ animating, className, isLeaving, render: Render, style, ...rest }: AniProps) => <a.div {...{
  className: `fy-slide-frame${ className ?  " " + className : "" }`,
  style
}}>
    <Render {...{ ...rest, animating }} />
  </a.div>;

export default function EntityInput({ accept, aspectRatio = "square", label, name = "", onChange, type, value, ...rest }: Props) {
  const { search } = useLocation();
  const urlSearch = new URLSearchParams(search);
  const presetToken = search ? urlSearch.get("preset_token") : "";
  const queryUser = search ? urlSearch.get("query_user") : "";
  const [mediaToken,mediaTokenSet] = useState(presetToken || value || "");
  const { media, mediaSet } = useMedia({ mediaToken });
  const clear = () => {
    mediaSet(undefined);
    mediaTokenSet("");
  };

  const selectToken = (token: string) => {
    mediaTokenSet(token);
    onChange({ target: { name, value: token } });
  };

  const { inputProps } = useMediaUploader({
    autoUpload: true,
    onSuccess: (res: UploaderResponse) => selectToken(res.media_file_token)
  });

  const onSelect = (data: MediaFile) => {
    mediaSet(data);
    selectToken(data.token);
  };

  const busy = false;
  const index = busy ? 0 : media ? 1 : 2;
  const [animating,animatingSet] = useState(false);

  const transitions = useTransition(index, {
    config: { mass: 1, tension: 80, friction: 10 },
    from: { opacity: 0, transform: `translateX(${ 5 }rem)` },
    enter: { opacity: 1, transform: `translateX(0)` },
    leave: { opacity: 0, transform: `translateX(${ 5 }rem)` },
    onRest: () => animatingSet(false),
    onStart: () => animatingSet(true)
  });


  useEffect(() => {
    if (presetToken && value !== presetToken) onChange({ target: { name, value: presetToken } });
  },[presetToken, name, onChange, value]);

  return <>
    <Label {...{ label }}/>
    <div {...{ className: `fy-entity-input panel-inner${ aspectRatio ? " fy-entity-input-" + aspectRatio : "" }`, }}>
      { 
        transitions((style: any, i: number, state: any) => {
          let isLeaving = state.phase === "leave";
          let sharedProps = { animating, isLeaving, style };

          return [
            <AnimatedSlide {...{
              className: "fy-entity-input-busy",
              render: MediaBusy,
              ...sharedProps
            }}/>,
            <AnimatedSlide {...{
              className: "fy-entity-input-full",
              clear,
              media,
              render: EntityInputFull,
              ...sharedProps
            }}/>,
            <AnimatedSlide {...{
              accept,
              className: "fy-entity-input-empty",
              inputProps,
              onSelect,
              queryUser,
              render: EntityInputEmpty,
              type,
              ...sharedProps,
              ...rest
            }}/>
          ][i];
        })
      }
    </div>
  </>;
};

  // const handleTargetChange = (ev: React.FormEvent<HTMLSelectElement>) => {
  //   const value = (ev.target as HTMLSelectElement).value;
  //   setTarget(value);
  // };
