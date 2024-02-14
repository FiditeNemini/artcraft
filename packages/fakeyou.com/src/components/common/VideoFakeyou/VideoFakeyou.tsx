import React, { useState } from "react";
import { useMedia } from "hooks";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import makeClass from "resources/makeClass";



interface Props {
  className?: string;
  src?: string;
  mediaToken?: string;
}

export default function VideoFromFakeyou({
  className,
  src,
  mediaToken,
  ...rest
}: Props) {
  const [mediaFile, setMediaFile] = useState<MediaFile>();
  useMedia({
    mediaToken: mediaToken,
    onSuccess: (res: any) => {
      setMediaFile(res)
    },
  });

  const mediaLink = src || (mediaFile && new BucketConfig().getGcsUrl(mediaFile.public_bucket_path));

  if (mediaLink){
    return (
      <div {...{ ...makeClass("fy-basic-video",className) }}>
        <video controls key={mediaToken} {...rest}>
          <source src={mediaLink} type="video/mp4" />
        </video>
      </div>
    )
  }
  return null;
};