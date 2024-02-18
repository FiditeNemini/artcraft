import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import Iframe from "react-iframe";
import { Label, Spinner } from "components/common";
import { AcceptTypes, EntityInputMode, EntityModeProp } from "components/entities/EntityTypes";
import { useFile, useMedia, useModal, useSession } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { UploadMedia, UploadMediaResponse } from "@storyteller/components/src/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import EntityInputEmpty from "./EntityInputEmpty";
import "./EntityInput.scss";

interface Props {
  accept?: AcceptTypes | AcceptTypes[],
  aspectRatio?: "square" | "landscape" | "portrait",
  label?: string, 
  onChange?: any,
  type: EntityModeProp,
}

export interface SlideProps {
  media?: MediaFile
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

const MocapInputFull = ({ media }: SlideProps) => {
  const bucketConfig = new BucketConfig();
  const mediaUrl = media?.public_bucket_path ? bucketConfig.getGcsUrl(media.public_bucket_path) : "";

  return <>
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
};

const AniMod = ({ animating, className, isLeaving, render: Render, style, ...rest }: AniProps) => <a.div {...{
  className: `fy-slide-frame${ className ?  " " + className : "" }`,
  style
}}>
    <Render {...{ ...rest, animating }} />
  </a.div>;

export default function EntityInput({ accept: inAccept, aspectRatio = "square", label, onChange, type, ...rest }: Props) {
  const accept = Array.isArray(inAccept) ? inAccept : [inAccept];
  const inputMode = EntityInputMode[type];
  const { search } = useLocation();
  const presetToken = search ? new URLSearchParams(search).get("preset_token") : "";
  const [mediaToken,mediaTokenSet] = useState(presetToken || "");
  const { media, mediaSet } = useMedia({ mediaToken });
  const { user } = useSession();
  const { open } = useModal();

  const selectToken = (token: string) => {
    mediaTokenSet(token);
    onChange({ target: { name: "temp", value: token } });
  };

  const { clear, inputProps } = useFile({
    onChange: (inputFile: any) => {
      if (inputFile) UploadMedia({
        uuid_idempotency_token: uuidv4(),
        file: inputFile,
        source: "file",
      })
      .then((res: UploadMediaResponse) => {
        if ("media_file_token" in res) {
          clear();
          selectToken(res.media_file_token);
        }
      });
      else console.log("🥺 no file");
    }
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

  return <>
    <Label {...{ label }}/>
    <div {...{ className: `fy-entity-input panel-inner${ aspectRatio ? " fy-entity-input-" + aspectRatio : "" }`, }}>
      { 
        transitions((style: any, i: number, state: any) => {
          let isLeaving = state.phase === "leave";
          let sharedProps = { animating, isLeaving, media, style };

          return [
            <AniMod {...{ render: MediaBusy, className: "fy-entity-input-busy", ...sharedProps }}/>,
            <AniMod {...{ render: MocapInputFull, className: "fy-entity-input-full", ...sharedProps }}/>,
            <AniMod {...{ render: EntityInputEmpty, className: "fy-entity-input-empty", accept, inputMode, inputProps, onSelect, open, user, ...sharedProps, ...rest }}/>
          ][i];
        })
      }
    </div>
  </>;
};