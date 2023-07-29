import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { motion } from "framer-motion";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { Link } from "react-router-dom";
import { container, item } from "../../../../data/animation";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function ChannelsPage(props: Props) {
  usePrefixedDocumentTitle("Channels");
  PosthogClient.recordPageview();

  let videoBlock = (
    <motion.div className="col-12 col-sm-6 col-md-4" variants={item}>
      <Link to="/">
        <div className="ratio ratio-16x9 channel-thumbnail">
          <img
            src="/video-thumbnails/placeholder-thumbnail.webp"
            alt="Channel Thumbnail"
          />
        </div>
      </Link>
      <Link to="/">
        <div className="d-flex pt-2 gap-2 align-items-center">
          <div className="channel-profile">
            <img
              src="/video-thumbnails/placeholder-pfp.jpg"
              alt="Channel Profile"
            />
          </div>
          <div>
            <h6 className="fw-medium channel-title">Channel Title</h6>
            <p className="channel-name">Channel Name</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      className="container py-2 py-lg-5 px-md-4 px-lg-5 px-xl-3"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.h1 className=" fw-bold mb-4" variants={item}>
        Channels
      </motion.h1>

      <div className="row gy-4">
        {videoBlock}
        {videoBlock}
        {videoBlock}
        {videoBlock}
        {videoBlock}
        {videoBlock}
        {videoBlock}
        {videoBlock}
        {videoBlock}
      </div>
    </motion.div>
  );
}

export { ChannelsPage };
