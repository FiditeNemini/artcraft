import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MediaAudioComponent from "./MediaAudioComponent";
import MediaVideoComponent from "./MediaVideoComponent";
import MediaImageComponent from "./MediaImageComponent";
import MediaData from "./MediaDataTypes";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Skeleton from "components/common/Skeleton";
import Button from "components/common/Button";
import {
  faCircleExclamation,
  faArrowDownToLine,
} from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import useTimeAgo from "hooks/useTimeAgo";
// import { RatingButtons } from "v2/view/_common/ratings/RatingButtons";
// import { RatingStats } from "v2/view/_common/ratings/RatingStats";

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
  model_used: "Ash Ketchum",
  model_link: "/tts/TM:6g1mfb9b6fb8",
  creator_set_visibility: "public",
  created_at: "2023-05-12T07:49:53Z",
  updated_at: "2023-05-12T07:49:53Z",
};

export default function MediaPage({ sessionWrapper }: MediaPageProps) {
  const { token } = useParams<{ token: string }>();
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const timeCreated = useTimeAgo(mediaData?.created_at || "");

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
        return <MediaAudioComponent mediaData={data} />;
      case "video":
        return (
          <div className="ratio ratio-16x9">
            <MediaVideoComponent mediaData={data} />
          </div>
        );

      case "image":
        return <MediaImageComponent mediaData={data} />;
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
            <div className="col-12 col-xl-8">
              <h1 className="mb-0">
                <Skeleton />
              </h1>
            </div>
            <div className="col-12 col-xl-4">
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

  const audioDetails = [
    { property: "Type", value: mediaData.media_type },
    { property: "Created at", value: mediaData.created_at },
    { property: "Visibility", value: mediaData.creator_set_visibility },
    {
      property: "Model",
      value: mediaData.model_used,
      link: mediaData.model_link,
    },
    {
      property: "Vocoder",
      value: "Test",
    },
    {
      property: "Language",
      value: mediaData.model_used,
    },
    {
      property: "Model",
      value: mediaData.model_used,
    },
  ];

  const videoDetails = [
    { property: "Type", value: mediaData.media_type },
    { property: "Created at", value: mediaData.created_at },
    { property: "Visibility", value: mediaData.creator_set_visibility },
  ];

  let pageTitle = "Result";
  let pageSubText = "This is the result of your media.";
  let mediaDetails = undefined;

  switch (mediaData.media_type) {
    case "audio":
      pageTitle = "Audio Result";
      pageSubText = mediaData.token;
      mediaDetails = (
        <Accordion.Item title="Audio Details" defaultOpen={true}>
          <DataTable data={audioDetails} />
        </Accordion.Item>
      );
      break;
    case "video":
      pageTitle = "Video Result";
      pageSubText = mediaData.token;
      mediaDetails = (
        <Accordion.Item title="Video Details" defaultOpen={true}>
          <DataTable data={videoDetails} />
        </Accordion.Item>
      );
      break;
    case "image":
      pageTitle = "Image Model";
      pageSubText = "Image Model SubText";
      break;
    default:
  }

  // const resultRatings = (
  //   <div className="d-flex flex-column flex-lg-row flex-column-reverse gap-3">
  //     <div className="d-flex gap-3">
  //       <RatingButtons entity_type="v2v_model" entity_token="test" />
  //     </div>
  //     <RatingStats positive_votes={100} negative_votes={0} total_votes={100} />
  //   </div>
  // );

  return (
    <Container type="panel">
      <PageHeader title={pageTitle} subText={pageSubText} />
      <Panel padding={true}>
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="media-wrapper">
              {renderMediaComponent(mediaData)}
            </div>
          </div>
          <div className="col-12 col-xl-4 d-flex flex-column gap-4">
            <div className="d-flex gap-2">
              <Gravatar
                size={48}
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
                  className="fw-medium"
                  to={`/profile/${mediaData.maybe_creator_user.display_name}`}
                >
                  {mediaData.maybe_creator_user.display_name}
                </Link>
                {timeCreated}
              </div>
            </div>

            <Accordion>{mediaDetails}</Accordion>

            <div className="d-flex">
              <Button
                icon={faArrowDownToLine}
                label="Download Result"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </Panel>
    </Container>
  );
}
