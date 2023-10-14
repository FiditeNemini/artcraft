import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AudioComponent from "./AudioComponent";
import VideoComponent from "./VideoComponent";
import ImageComponent from "./ImageComponent";
import MediaData from "./MediaDataTypes";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Skeleton from "components/common/Skeleton";
import Button from "components/common/Button";
import { faCircleExclamation } from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";

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
    display_name: "Hanashi",
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
        return (
          <div className="ratio ratio-16x9">
            <VideoComponent mediaData={data} />
          </div>
        );

      case "image":
        return <ImageComponent mediaData={data} />;
      default:
        return <div>Unsupported media type</div>;
    }
  }

  if (isLoading)
    return (
      <Container type="panel">
        <PageHeader
          title={<Skeleton type="medium" />}
          subText={<Skeleton type="short" />}
        />
        <Panel padding={true}>
          <div className="row">
            <div className="col-12 col-md-8">
              <h1 className="mb-0">
                <Skeleton />
              </h1>
            </div>
            <div className="col-12 col-md-4">
              <h1 className="mb-0">
                <Skeleton />
              </h1>
            </div>
          </div>
        </Panel>
      </Container>
    );

  if (error || !mediaData)
    return (
      <Container type="panel">
        <PageHeader
          titleIcon={faCircleExclamation}
          title="Media not found"
          subText="This media does not exist or is private."
          extension={
            <div className="d-flex">
              <Button label="Back to homepage" to="/" className="d-flex" />
            </div>
          }
        />
      </Container>
    );

  const mediaDetails = [
    { property: "Type", value: mediaData.media_type },
    { property: "Created at", value: mediaData.created_at },
    { property: "Visibility", value: mediaData.creator_set_visibility },
    { property: "Model Used", value: "Model Name" },
  ];

  return (
    <Container type="panel">
      <PageHeader
        title="Model name"
        subText={mediaData.maybe_creator_user.display_name}
      />
      <Panel padding={true}>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {renderMediaComponent(mediaData)}
          </div>
          <div className="col-12 col-lg-4">
            <div className="d-flex">
              <Gravatar
                size={50}
                username={mediaData.maybe_creator_user.display_name}
                avatarIndex={
                  mediaData.maybe_creator_user.default_avatar.image_index
                }
                backgroundIndex={
                  mediaData.maybe_creator_user.default_avatar.color_index
                }
              />
              <div className="d-flex flex-column">
                <Link
                  to={`/profile/${mediaData.maybe_creator_user.display_name}`}
                >
                  {mediaData.maybe_creator_user.display_name}
                </Link>
              </div>
            </div>
            <Accordion>
              <Accordion.Item title="Details" defaultOpen={true}>
                <DataTable data={mediaDetails} />
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      </Panel>
    </Container>
  );
}
