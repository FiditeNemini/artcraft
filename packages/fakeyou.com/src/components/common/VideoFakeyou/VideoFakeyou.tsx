import React, { useState, forwardRef } from "react";
import { useMedia } from "hooks";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import makeClass from "resources/makeClass";

import { Label } from "components/common"



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
  const [mediaFile, setMediaFile] = useState<MediaFile>();
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
      <div {...{ ...makeClass("fy-basic-video",className) }}>
        {label && <Label label={label}/>}
        <video controls key={mediaToken} {...rest} ref={ref}>
          <source src={mediaLink} type="video/mp4" />
        </video>
      </div>
    )
  }
  return null;
});

export default VideoFromFakeyou;