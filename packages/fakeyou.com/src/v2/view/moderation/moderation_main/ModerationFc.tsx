import React from "react";
import { Link } from "react-router-dom";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faClipboardCheck,
  faListCheck,
  faMicrophone,
  faTags,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ModerationFc(props: Props) {
  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div>
      <div className="container py-5">
        <h1 className="display-5 fw-bold text-center text-lg-start">
          Moderation Controls
        </h1>
      </div>

      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Emergency</h2>
          <div className="py-6">
            <div className="d-flex flex-column gap-3">
              <Link to="/moderation/ip_bans" className="btn btn-primary w-100">
                <FontAwesomeIcon icon={faBan} className="me-2" />
                IP Bans
              </Link>
              <Link
                to="/moderation/job_stats"
                className="btn btn-primary w-100"
              >
                <FontAwesomeIcon icon={faListCheck} className="me-2" />
                Job Stats
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Lookup, Stats, and Editing</h2>
          <div className="py-6">
            <div className="d-flex flex-column gap-3">
              <Link
                to="/moderation/user/list"
                className="btn btn-secondary w-100"
              >
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                User List
              </Link>

              <Link
                to={FrontendUrlConfig.moderationTtsCategoryList()}
                className="btn btn-secondary w-100"
              >
                <FontAwesomeIcon icon={faTags} className="me-2" />
                Manage TTS Categories
              </Link>

              <Link
                to="/moderation/approve/w2l_templates"
                className="btn btn-secondary w-100"
              >
                <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                Unapproved W2L Templates
              </Link>

              <Link
                to="/moderation/voice_stats"
                className="btn btn-secondary w-100"
              >
                <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                Voice Stats
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        <p>
          More mod controls will be added in the future: user roles, activity
          tracking, timed bans, account bans, etc.
        </p>
      </div>
    </div>
  );
}

export { ModerationFc };
