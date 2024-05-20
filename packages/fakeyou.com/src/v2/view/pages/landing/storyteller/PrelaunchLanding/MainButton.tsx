import React, { useEffect, useState } from "react";
import "./PrelaunchLanding.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { faPersonToPortal } from "@fortawesome/pro-duotone-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

export function MainButton(props: Props) {
  if (props.sessionWrapper.canAccessStudio()) {
    return (
      <>
        <a
          href="https://studio.storyteller.ai"
          className="waitlist-button text-center"
        >
          Enter Storyteller Studio
          <FontAwesomeIcon 
            icon={faPersonToPortal} 
            className="ms-2 fs-6" 
          />
        </a>
      </>
    );

  } else {
    return (
      <>
        <a
          href="https://7mjlxvmjq8u.typeform.com/to/ZQTkv9ha"
          className="waitlist-button text-center"
        >
          Join the Waitlist
          <FontAwesomeIcon 
            icon={faArrowRight} 
            className="ms-2 fs-6" 
          />
        </a>
      </>
    );
  }
}
