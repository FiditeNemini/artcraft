import React, { useState, forwardRef } from "react";
import { useMedia } from "hooks";
import { MediaFileType } from "@storyteller/components/src/api";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import makeClass from "resources/makeClass";

import { Label } from "components/common";
import './styles.scss';


export interface VideoFakeyouProps{
  wrapperClassName?: string;
  controls?:boolean;
  muted?:boolean;
  className?:string;
  src?:string;
  mediaToken?: string;
  label?: string;
  onResponse?: (res:any)=>void
}

type Ref = HTMLVideoElement;

const VideoFakeyou = forwardRef<Ref, VideoFakeyouProps>(({
  wrapperClassName,
  controls,
  muted,
  className,
  src,
  mediaToken,
  label,
  onResponse,
  ...rest
}: VideoFakeyouProps, ref) => {
  const [mediaFile, setMediaFile] = useState<MediaFileType>();
  useMedia({
    mediaToken: mediaToken,
    onSuccess: (res: any) => {
      setMediaFile(res)
      if(onResponse) onResponse(res)
    },
  });

  const mediaLink = src || (mediaFile && new BucketConfig().getGcsUrl(mediaFile.public_bucket_path));

  if (mediaLink){
    return (
      <div {...{ ...makeClass("fy-video vh50",wrapperClassName) }}>
        {label && <Label label={label}/>}
        <video
          controls={controls}
          muted={muted}
          ref={ref} 
          key={mediaToken}
          {...{
            ...makeClass("object-fit-contain",className),
            ...rest
          }}
        >
          <source src={mediaLink} type="video/mp4" />
        </video>
      </div>
    )
  }
  return null;
});

export default VideoFakeyou;