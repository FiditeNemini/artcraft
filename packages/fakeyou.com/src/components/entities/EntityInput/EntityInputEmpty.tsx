import React from "react";
import { AcceptTypes, EntityInputMode, getMediaTypesByCategory, isSelectedType, mediaCategoryfromString, MediaFilters } from "components/entities/EntityTypes";
import { SlideProps } from "./EntityInput";
import { MediaBrowser } from "components/modals";
import { FileWrapper } from "components/common";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
  faDiagramSankey,
  faFile,
  faFileArrowUp,
  faGrid,
  faImage,
  faPersonWalking,
  faWaveform
 } from "@fortawesome/pro-solid-svg-icons";


interface EmptySlideProps extends SlideProps {
  accept?: AcceptTypes[],
  inputMode: EntityInputMode,
  inputProps?: any,
  open: any,
  user: any
};

export default function EntityInputEmpty({ accept, open, inputMode, inputProps, user, ...rest }: EmptySlideProps) {
  const accepted = accept ? accept : [];
  const isMedia = inputMode === EntityInputMode.media;
  const fileTypes = isMedia ? accepted.map((mediaCategory,i) => {
    return mediaCategory ? getMediaTypesByCategory(mediaCategoryfromString(mediaCategory)) : [];
  }).flat() : [];

  const browserClick = () => open({
    component: MediaBrowser,
    props: { accept, inputMode, username: user?.username || "", ...rest }
  });

  const mediaIcons = () => {
    if (isSelectedType(MediaFilters.audio,accepted[0])) return faWaveform;
    if (isSelectedType(MediaFilters.engine_asset,accepted[0])) return faPersonWalking;
    if (isSelectedType(MediaFilters.image,accepted[0])) return faImage;
    if (isSelectedType(MediaFilters.video,accepted[0])) return faFile;
    return faFile;
  };

  const supported = `${ fileTypes.length ? fileTypes.join(", ") : fileTypes[0] } files supported`;

  return <>
    <Icon {...{ className: "fy-entity-input-icon", icon: [faFile,mediaIcons(),faDiagramSankey,mediaIcons()][inputMode] }}/>
    <div {...{ className: "fy-entity-input-empty-controls" }}>
     { isMedia &&
        <FileWrapper {...{ containerClass: "fy-entity-input-row", fileTypes, panelClass: "fy-entity-input-button", noStyle: true, ...inputProps }}>
           <>
             <Icon {...{ className: "fy-entity-input-label-icon", icon: faFileArrowUp }}/>
             <div {...{ className: "fy-entity-input-upload-detail" }}>
               Upload, click or drag here
               { accept && <span>{ supported }</span> }
             </div>
           </>
         </FileWrapper> }
      <div {...{ className: "fy-entity-input-row fy-entity-input-button", onClick: browserClick }}>
        <Icon {...{ className: "fy-entity-input-label-icon", icon: faGrid }}/>
        Choose from your { ["bookmarks","media","weights"][inputMode] }
      </div>
    </div>
  </>;
};