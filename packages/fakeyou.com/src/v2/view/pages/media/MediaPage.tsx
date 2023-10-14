import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AudioComponent from "./AudioComponent";
import VideoComponent from "./VideoComponent";
import ImageComponent from "./ImageComponent";
import MediaData from "./MediaDataTypes";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface MediaPageProps {
  sessionWrapper: SessionWrapper;
}

// Dummy media data (replace with actual API data)
let dummyMediaData = {
  token: "m_v032bt6ecm0rwhebbhgdmk5rexf7cij",
  media_type: "video", // Change to somthing like "video" or "image" to test different types
  public_bucket_path:
    "/media/8/p/c/h/h/8pchhrgc0ayawn09s9gmtfec2mcft0xk/fakeyou_8pchhrgc0ayawn09s9gmtfec2mcft0xk.mp4", // Replace with actual URLs
  maybe_creator_user: {
    user_token: "u_00XGM6M2TE4J9",
    username: "hanashi",
    display_name: "hanashi",
    gravatar_hash: "c45b453fcb1d27b348504ae7f5d6a6c",
    default_avatar: {
      image_index: 1,
      color_index: 3,
    },
  },
  creator_set_visibility: "public",
  created_at: "2023-10-12T07:49:53Z",
  updated_at: "2023-10-12T07:49:53Z",
};

export default function MediaPage({ sessionWrapper }: MediaPageProps) {
  const { token } = useParams<{ token: string }>();
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      //Check if token is valid
      if (token !== dummyMediaData.token) {
        //if invalid token, set error to true
        setError(true);
        setIsLoading(false);
      } else {
        setMediaData(dummyMediaData);
        setIsLoading(false);
      }
    }, 1000);
  }, [token]);

  function renderMediaComponent(data: MediaData) {
    switch (data.media_type) {
      case "audio":
        return <AudioComponent mediaData={data} />;
      case "video":
        return <VideoComponent mediaData={data} />;
      case "image":
        return <ImageComponent mediaData={data} />;
      default:
        return <div>Unsupported media type</div>;
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error || !mediaData) return <div>Media not found</div>;

  return (
    <div>
      <h1>{mediaData?.token}</h1>
      {renderMediaComponent(mediaData)}
    </div>
  );
}
