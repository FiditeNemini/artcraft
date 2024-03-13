import React from "react";
import { AcceptTypes, EntityInputMode, MediaFilters } from "components/entities/EntityTypes";
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

const mediaCheck = (value: string) => (value in MediaFilters);

export default function EntityInputEmpty({ accept, open, inputMode, inputProps, user, ...rest }: EmptySlideProps) {
  const accepted = accept ? accept : [];
  const isMedia = !!accepted.find(mediaCheck);
  const browserClick = () => open({
    component: MediaBrowser,
    props: { accept, inputMode, username: user?.username || "", ...rest }
  });

  const mediaIcons = () => {
    switch (accepted[0]) {
      case "mp3": return faWaveform;
      case "jpg": return faImage;
      case "bvh": return faPersonWalking;
      default: return faFile;
    }
  };

  const supported = `${ accepted.length ? accepted.join(", ") : accepted[0] } files supported`;

  return <>
    <Icon {...{ className: "fy-entity-input-icon", icon: [faFile,mediaIcons(),faDiagramSankey,mediaIcons()][inputMode] }}/>
    <div {...{ className: "fy-entity-input-empty-controls" }}>
     { isMedia &&
        <FileWrapper {...{ containerClass: "fy-entity-input-row", fileTypes: accepted, panelClass: "fy-entity-input-button", noStyle: true, ...inputProps }}>
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