import React from "react";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"; // for now
import { faPersonWalking } from "@fortawesome/pro-solid-svg-icons";

export const ImagePreview = ({ data }: { data: any }) => {
  const bucketConfig = new BucketConfig();
  const coverImage = bucketConfig.getCdnUrl(data.public_bucket_path, 600, 100);

  return <img {...{ alt: data.weight_name, className: "card-img", src: coverImage }} />;
};

export const VideoPreview = ({ data }: { data: any }) => {

  const { default_cover, maybe_cover_image_public_bucket_path } = data?.cover_image || {};

  const bucketConfig = new BucketConfig();
  //video doesnt have random cover image endpoint or thumbnails yet
  let coverImage = `/images/default-covers/${ default_cover?.image_index || 0  }.webp`;

  if (maybe_cover_image_public_bucket_path) {
    coverImage = bucketConfig.getCdnUrl(maybe_cover_image_public_bucket_path, 600, 100);
  }

  return <img {...{ alt: data.weight_name, className: "card-video", src: coverImage }} />;
};

export const MocapPreview = () => <Icon {...{ className: "card-img", icon: faPersonWalking }}/>;

// export const ImagePreview = previwImg("card-img");
// export const VideoPreview = previwImg("card-video");