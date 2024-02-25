import React, { useState, forwardRef } from "react";
import { useMedia } from "hooks";
import { MediaFileType } from "@storyteller/components/src/api";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import makeClass from "resources/makeClass";

import { Label } from "components/common";
import './styles.scss';


interface Props {
  className?: string;
  src?: string;
  mediaToken?: string;
  label?: string;
  onResponse?: (res:any)=>void
}

type Ref = HTMLVideoElement;

const VideoFromFakeyou = forwardRef<Ref, Props>(({
  className,
  src,
  mediaToken,
  label,
  onResponse,
  ...rest
}: Props, ref) => {
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
      <div {...{ ...makeClass("fy-video vh50",className) }}>
        {label && <Label label={label}/>}
        <video 
          controls 
          ref={ref} 
          key={mediaToken}
          className="object-fit-contain"
          {...rest}
        >
          <source src={mediaLink} type="video/mp4" />
        </video>
      </div>
    )
  }
  return null;
});

export default VideoFromFakeyou;