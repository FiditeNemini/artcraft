import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import Iframe from "react-iframe";
import { MediaBrowser } from "components/modals";
import { FileWrapper, Label, Spinner } from "components/common";
import { EntityType, MediaFilterProp, WeightFilterProp } from "components/entities/EntityTypes";
import { useFile, useMedia, useModal, useSession } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { faFileArrowUp, faGrid, faPersonWalking } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { UploadMedia, UploadMediaResponse } from "@storyteller/components/src/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import "./EntityInput.scss";

interface Props {
  label?: string, 
  onChange?: any,
  mediaType?: MediaFilterProp,
  aspectRatio?: "square" | "landscape" | "portrait",
  weightType?: WeightFilterProp,
}

interface SlideProps {
  media?: MediaFile
};

interface EmptySlideProps extends SlideProps {
  entityType: EntityType,
  filterType: MediaFilterProp | WeightFilterProp,
  inputProps?: any,
  onSelect: any,
  open: any,
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
          className: "fy-entity-input-mocap-preview",
        }}
      />
    <div {...{ className: "fy-entity-input-full-controls" }}>
      Your file
    </div>
  </>;
};

const MediaPickerEmpty = ({ entityType, filterType, media, onSelect, open, inputProps, user }: EmptySlideProps) => {
  const browserClick = () => open({
    component: MediaBrowser,
    props: { entityType, filterType, onSelect, username: user?.username || "" }
  });

  return <>
    <Icon {...{ className: "fy-entity-input-icon", icon: faPersonWalking }}/>
    <div {...{ className: "fy-entity-input-empty-controls" }}>
      <FileWrapper {...{ containerClass: "fy-entity-input-row", panelClass: "fy-entity-input-button", noStyle: true, ...inputProps }}>
        <>
        <Icon {...{ className: "fy-entity-input-label-icon", icon: faFileArrowUp }}/>
        Upload, click or drag here
        </>
      </FileWrapper>
      <div {...{ className: "fy-entity-input-row fy-entity-input-button", onClick: browserClick }}>
        <Icon {...{ className: "fy-entity-input-label-icon", icon: faGrid }}/>
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

export default function EntityInput({ aspectRatio = "square", label, onChange, mediaType, weightType }: Props) {
  const entityType = mediaType ? EntityType.media : weightType ? EntityType.weights : EntityType.unknown;
  const filterType = mediaType || weightType || "all";
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
    <div {...{ className: `fy-entity-input panel-inner${ aspectRatio ? " fy-entity-input-" + aspectRatio : "" }`, }}>
      { 
        // media ? <MocapInputFull {...{ media }}/> : <MediaPickerEmpty {...{ inputProps, media, onSelect, open, user }}/>
        transitions((style: any, i: number, state: any) => {
          let isLeaving = state.phase === "leave";
          let sharedProps = { animating, isLeaving, media, style };

          return [
            <AniMod {...{ render: MediaBusy, className: "fy-entity-input-busy", ...sharedProps }}/>,
            <AniMod {...{ render: MocapInputFull, className: "fy-entity-input-full", ...sharedProps }}/>,
            <AniMod {...{ render: MediaPickerEmpty, className: "fy-entity-input-empty", entityType, filterType, inputProps, onSelect, open, user, ...sharedProps }}/>
          ][i];
        
        })
      }
    </div>
  </>;
};