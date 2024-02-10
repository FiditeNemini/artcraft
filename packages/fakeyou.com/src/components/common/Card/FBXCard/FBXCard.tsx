import React from "react";
import { Link } from "react-router-dom";
import Card from "../Card";
import { CardFooter } from "components/entities";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/pro-solid-svg-icons";
import getCardUrl from "../getCardUrl";

interface FBXCardProps {
  bookmarks: any;
  data: any;
  ratings: any;
  showCreator?: boolean;
  source?: string;
  type: "media" | "weights";
}

export default function FBXCard({
  bookmarks,
  data,
  showCreator,
  source = "",
  ratings,
  type,
}: FBXCardProps) {
  const linkUrl = getCardUrl(data, source, type);

  const timeAgo = useTimeAgo(data.created_at);

  return (
    <Link
      {...{
        to: linkUrl,
      }}
    >
      <Card padding={false} canHover={true}>
        <div className="card-img d-flex align-items-center justify-content-center">
          <FontAwesomeIcon icon={faCube} className="card-img-icon" />
        </div>

        <div className="card-img-overlay">
          <div className="card-img-gradient" />

          <div className="d-flex align-items-center">
            <div className="d-flex flex-grow-1">
              <Badge {...{ className: "fy-entity-type-fbx", label: "FBX", overlay: true }}/>
            </div>
          </div>

          <div className="card-img-overlay-text">
            <div>
              <p className="fs-7 opacity-75 mb-0">{timeAgo}</p>
            </div>
            <CardFooter {...{
              creator: data?.maybe_creator, 
              entityToken: data.token,
              entityType: "media_file",
              makeBookmarksProps: bookmarks.makeProps,
              makeRatingsProps: ratings.makeProps
            }}/>
          </div>
        </div>
      </Card>
    </Link>
  );
}
