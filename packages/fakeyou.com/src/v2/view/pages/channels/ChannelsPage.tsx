import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {} from "@fortawesome/free-solid-svg-icons";
import {} from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";
import { container, item } from "../../../../data/animation";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { TwitchPlayerNonInteractive, TwitchChat } from "react-twitch-embed";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ChannelsPage(props: Props) {
  usePrefixedDocumentTitle("Channels");

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container-panel py-5 px-md-4 px-lg-5 px-xl-3">
        <div className="row gx-3">
          <div className="col-12 col-lg-9 d-flex flex-column gap-3">
            {/* <div className="d-flex flex-column ms-3 ms-lg-0">
              <motion.h1 className="fw-bold" variants={item}>
                Media Feed
              </motion.h1>
            </div> */}

            {/* Feed Content */}
            <motion.div variants={item} className="d-flex flex-column gap-3">
              <TwitchPlayerNonInteractive
                channel="testytest512"
                width="100%"
                autoplay
                muted
              />
            </motion.div>
          </div>

          {/* Side column */}
          <div className="col-3 d-none d-lg-flex flex-column gap-3">
            <TwitchChat channel="moonstar_x" darkMode />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { ChannelsPage };
