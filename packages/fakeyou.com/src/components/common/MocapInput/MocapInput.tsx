import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import Iframe from "react-iframe";
import { MediaBrowser } from "components/modals";
import { FileWrapper, Label, Spinner } from "components/common";
import { EntityType, MediaFilterProp } from "components/entities/EntityTypes";
import { useFile, useMedia, useModal, useSession } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { faFileArrowUp, faGrid, faPersonWalking } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { UploadMedia, UploadMediaResponse } from "@storyteller/components/src/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import "./MocapInput.scss"

interface Props {
  label?: string, 
  onChange?: any,
  type?: MediaFilterProp,
  aspectRatio?: "square" | "landscape" | "portrait"
}

interface SlideProps {
  media?: MediaFile
};

interface EmptySlideProps extends SlideProps {
  inputProps?: any,
  onSelect: any,
  open: any,
  type: MediaFilterProp,
  user: any
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
  const bvhUrl = media?.public_bucket_path ? bucketConfig.getGcsUrl(media.public_bucket_path) : "";

  return <>
    <Iframe
        {...{
          url: `https://engine.fakeyou.com?mode=viewer&bvh=${bvhUrl}`,
          className: "fy-media-picker-mocap-preview",
        }}
      />
    <div {...{ className: "fy-media-picker-full-controls" }}>
      Your file
    </div>
  </>;
};

const MediaPickerEmpty = ({ media, onSelect, open, inputProps, type, user }: EmptySlideProps) => {
  const browserClick = () => open({
    component: MediaBrowser,
    props: { entityType: EntityType.media, onSelect, type, username: user?.username || "" }
  });

  return <>
    <Icon {...{ className: "fy-media-picker-icon", icon: faPersonWalking }}/>
    <div {...{ className: "fy-media-picker-empty-controls" }}>
      <FileWrapper {...{ containerClass: "fy-media-picker-row", panelClass: "fy-media-picker-button", noStyle: true, ...inputProps }}>
        <>
        <Icon {...{ className: "fy-media-picker-label-icon", icon: faFileArrowUp }}/>
        Upload, click or drag here
        </>
      </FileWrapper>
      <div {...{ className: "fy-media-picker-row fy-media-picker-button", onClick: browserClick }}>
        <Icon {...{ className: "fy-media-picker-label-icon", icon: faGrid }}/>
        Choose from your media
      </div>
    </div>
  </>;
}

const AniMod = ({ animating, className, isLeaving, render: Render, style, ...rest }: AniProps) => <a.div {...{
  className: `fy-slide-frame${ className ?  " " + className : "" }`,
  style
}}>
    <Render {...{ ...rest, animating }} />
  </a.div>;

export default function MocapInput({ aspectRatio = "square", label, onChange, type }: Props) {
  const { search } = useLocation();
  const presetToken = search ? new URLSearchParams(search).get("preset_token") : "";
  const [mediaToken,mediaTokenSet] = useState(presetToken || "");
  const { media, mediaSet } = useMedia({ mediaToken });
  const { user } = useSession();
  const { open } = useModal();
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
          mediaTokenSet(res.media_file_token);
        }
      });
      else console.log("🥺 no file");
    }
  });
  const onSelect = (data: MediaFile) => {
    mediaSet(data)
    onChange({ target: { name: "temp", value: data.token } });
  }
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
    <div {...{ className: `fy-mocap-input panel-inner${ aspectRatio ? " fy-media-input-" + aspectRatio : "" }`, }}>
      { 
        // media ? <MocapInputFull {...{ media }}/> : <MediaPickerEmpty {...{ inputProps, media, onSelect, open, user }}/>
        transitions((style: any, i: number, state: any) => {
          let isLeaving = state.phase === "leave";
          let sharedProps = { animating, isLeaving, media, style };

          return [
            <AniMod {...{ render: MediaBusy, className: "fy-media-picker-busy", ...sharedProps }}/>,
            <AniMod {...{ render: MocapInputFull, className: "fy-media-picker-full", ...sharedProps }}/>,
            <AniMod {...{ render: MediaPickerEmpty, className: "fy-media-picker-empty", inputProps, onSelect, open, type, user, ...sharedProps }}/>
          ][i];
        
        })
      }
    </div>
  </>;
};