import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AudioComponent from "./AudioComponent";
import VideoComponent from "./VideoComponent";
import ImageComponent from "./ImageComponent";

const MediaFilePage = () => {
  const { token } = useParams();
  const [mediaData, setMediaData] = useState<{} | null>(null);

  // Dummy media data (replace with actual API data)
  const dummyMediaData = {
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

  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      setMediaData(dummyMediaData); // Replace with actual API data
    }, 1000); // Simulated delay of 1 second
  }, [token]);

  const renderMediaComponent = () => {
    if (!mediaData) {
      return <div>Loading...</div>;
    }

    switch (dummyMediaData.media_type) {
      case "audio":
        return <AudioComponent mediaData={dummyMediaData} />;
      case "video":
        return <VideoComponent mediaData={dummyMediaData} />;
      case "image":
        return <ImageComponent mediaData={dummyMediaData} />;
      default:
        return <div>Unsupported media type</div>;
    }
  };

  return (
    <div>
      <h1>{dummyMediaData.token}</h1>
      {renderMediaComponent()}
    </div>
  );
};

export default MediaFilePage;
