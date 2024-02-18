import React from "react";
import { Link } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import { CardFooter } from "components/entities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonWalking } from "@fortawesome/pro-solid-svg-icons";
import getCardUrl from "../getCardUrl";

interface BVHCardProps {
  bookmarks: any;
  data: any;
  onClick?: (e:any) => any;
  ratings: any;
  showCreator?: boolean;
  source?: string;
  type: "media" | "weights";
}

export default function BVHCard({
  bookmarks,
  data,
  onClick: inClick,
  showCreator,
  source = "",
  ratings,
  type,
}: BVHCardProps) {
  const linkUrl = getCardUrl(data, source, type);
  const timeAgo = useTimeAgo(data.created_at);

  const Wrapper = ({ children }: { children: any }) => inClick ? <div {...{ onClick: () => { inClick(data) } }}>{ children }</div> : <Link {...{ to: linkUrl  }}>{ children }</Link>;

  // const bucketConfig = new BucketConfig();

  return (
    <Wrapper>
      <Card padding={false} canHover={true}>
        <div className="card-img d-flex align-items-center justify-content-center">
          <FontAwesomeIcon icon={faPersonWalking} className="card-img-icon" />
        </div>

        <div className="card-img-overlay">
          <div className="card-img-gradient" />

          <div className="d-flex align-items-center">
            <div className="d-flex flex-grow-1">
              <Badge  {...{ className: "fy-entity-type-bvh", label: "BVH", overlay: true }}/>
            </div>
          </div>

          <div className="card-img-overlay-text">
            <div>
              <p className="fs-7 opacity-75 mb-0">{timeAgo}</p>
            </div>
            <CardFooter {...{
              creator: data?.maybe_creator || data.details?.maybe_media_file_data?.maybe_creator,
              entityToken: data.details?.entity_token || data.token,
              entityType: "media_file",
              makeBookmarksProps: bookmarks?.makeProps,
              makeRatingsProps: ratings?.makeProps,
              showCreator
            }}/>
          </div>
        </div>
      </Card>
    </Wrapper>
  );
}
