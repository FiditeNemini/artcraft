import React, { useState, useEffect, useRef } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faFlagCheckered,
  faAward,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faDiscord,
  faTwitch,
} from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";
import { duration, delay, container, item } from "../../../../data/animation";

const Fade = require("react-reveal/Fade");

interface FirehoseEventListResponsePayload {
  success: boolean;
  events: Array<FirehoseEvent>;
}

interface FirehoseEvent {
  event_token: string;
  event_type: string;
  maybe_target_user_token?: string;
  maybe_target_username?: string;
  maybe_target_display_name?: string;
  maybe_target_user_gravatar_hash?: string;
  maybe_target_entity_token?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
}

function FirehoseEventListPage(props: Props) {
  const [firehoseEvents, setFirehoseEvents] = useState<Array<FirehoseEvent>>(
    []
  );

  const fetchEvents = () => {
    const api = new ApiConfig();
    const endpointUrl = api.firehoseEvents();

    fetch(endpointUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        const firehoseResponse: FirehoseEventListResponsePayload = res;
        if (!firehoseResponse.success) {
          return;
        }

        setFirehoseEvents(firehoseResponse.events);
      })
      .catch((e) => {
        // ignored
      });
  };

  const componentIsMounted = useRef(true);

  const doSetTimeout = () => {
    fetchEvents();
    if (componentIsMounted.current) {
      setTimeout(doSetTimeout, 5000);
    }
  };

  useEffect(() => {
    doSetTimeout();
    return () => {
      componentIsMounted.current = false;
    };
    // NB: This is a valid use case
    // eslint-disable-next-line
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let eventItems: Array<JSX.Element> = [];

  firehoseEvents.slice(0, 16).forEach((event) => {
    let inner = <span />;
    let userLink = <span>Anonymous user</span>;
    let gravatar = <span />;

    if (
      event.maybe_target_username !== undefined &&
      event.maybe_target_username !== null &&
      event.maybe_target_user_token !== undefined &&
      event.maybe_target_user_token !== null
    ) {
      let link = `/profile/${event.maybe_target_username}`;
      userLink = <Link to={link}>{event.maybe_target_display_name}</Link>;
      gravatar = (
        <Gravatar
          size={15}
          username={event.maybe_target_username}
          email_hash={event.maybe_target_user_gravatar_hash}
        />
      );
    }

    switch (event.event_type) {
      case "user_sign_up":
        inner = (
          <span>
            <FontAwesomeIcon icon={faPenToSquare} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;signed up for FakeYou!
          </span>
        );
        break;
      case "user_badge_granted":
        inner = (
          <span>
            <FontAwesomeIcon icon={faAward} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;got a badge!
          </span>
        );
        break;
      case "tts_model_upload_started":
        inner = (
          <span>
            <FontAwesomeIcon icon={faPlay} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;started TTS model upload
          </span>
        );
        break;
      case "tts_model_upload_completed":
        inner = (
          <span>
            <FontAwesomeIcon icon={faFlagCheckered} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;completed TTS model upload
          </span>
        );
        break;
      case "tts_inference_started":
        inner = (
          <span>
            <FontAwesomeIcon icon={faPlay} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;started TTS
          </span>
        );
        break;
      case "tts_inference_completed":
        inner = (
          <span>
            <FontAwesomeIcon icon={faFlagCheckered} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;completed TTS
          </span>
        );
        break;
      case "w2l_template_upload_started":
        inner = (
          <span>
            <FontAwesomeIcon icon={faPlay} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;started uploading a lipsync template.
          </span>
        );
        break;
      case "w2l_template_upload_completed":
        inner = (
          <span>
            <FontAwesomeIcon icon={faFlagCheckered} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;finished uploading a lipsync template.
          </span>
        );
        break;
      case "w2l_inference_started":
        inner = (
          <span>
            <FontAwesomeIcon icon={faPlay} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;started a W2L lipsync video
          </span>
        );
        break;
      case "w2l_inference_completed":
        inner = (
          <span>
            <FontAwesomeIcon icon={faFlagCheckered} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;completed a W2L lipsync video
          </span>
        );
        break;
      case "twitter_mention":
        inner = (
          <span>
            <FontAwesomeIcon icon={faTwitter} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;mentioned us on twitter!
          </span>
        );
        break;
      case "twitter_retweet":
        inner = (
          <span>
            <FontAwesomeIcon icon={faTwitter} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;retweeted us!
          </span>
        );
        break;
      case "discord_join":
        inner = (
          <span>
            <FontAwesomeIcon icon={faDiscord} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;joined discord!
          </span>
        );
        break;
      case "discord_message":
        inner = (
          <span>
            <FontAwesomeIcon icon={faDiscord} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;sent a discord message
          </span>
        );
        break;
      case "twitch_subscribe":
        inner = (
          <span>
            <FontAwesomeIcon icon={faTwitch} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;subscribed to us on twitch!
          </span>
        );
        break;
      case "twitch_follow":
        inner = (
          <span>
            <FontAwesomeIcon icon={faTwitch} className="me-3" />
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;followed us on twitch!
          </span>
        );
        break;
      default:
        return;
    }

    eventItems.push(
      <li className="panel p-3 p-lg-3" key={event.event_token}>
        {inner}
      </li>
    );
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container py-5 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1 className="display-5 fw-bold" variants={item}>
            Firehose Event Feed
          </motion.h1>
          <motion.h4 className="mb-4" variants={item}>
            The latest FakeYou events refreshed every few seconds.
          </motion.h4>
          <motion.p className="lead" variants={item}>
            As you can see, we're really popular. But we owe it to you, our
            users. Thank you!
          </motion.p>
        </div>
      </div>

      <div className="container-panel pb-5">
        <Fade right cascade delay={delay} duration={duration} distance="100px">
          <ul className="firehose-ul d-flex flex-column gap-3">{eventItems}</ul>
        </Fade>
      </div>
    </motion.div>
  );
}

export { FirehoseEventListPage };
