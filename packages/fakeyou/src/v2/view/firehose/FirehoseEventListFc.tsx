import React, { useState, useEffect, useRef } from 'react';
import { ApiConfig } from '@storyteller/components';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Gravatar } from '@storyteller/components/src/elements/Gravatar';
import { Link } from "react-router-dom";

interface FirehoseEventListResponsePayload {
  success: boolean,
  events: Array<FirehoseEvent>,
}

interface FirehoseEvent {
  event_token: string,
  event_type: string,
  maybe_target_user_token?: string,
  maybe_target_username?: string,
  maybe_target_display_name?: string,
  maybe_target_user_gravatar_hash?: string,
  maybe_target_entity_token?: string,
  created_at: string,
  updated_at: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function FirehoseEventListFc(props: Props) {
  const [firehoseEvents, setFirehoseEvents] = useState<Array<FirehoseEvent>>([]);

  const fetchEvents = () => {
    const api = new ApiConfig();
    const endpointUrl = api.firehoseEvents();

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      console.log('list', res);
      const firehoseResponse : FirehoseEventListResponsePayload  = res;
      if (!firehoseResponse.success) {
        return;
      }

      setFirehoseEvents(firehoseResponse.events)
    })
    .catch(e => {
      // ignored
    });
  };

  const componentIsMounted = useRef(true)

  const doSetTimeout = () => {
    fetchEvents()
    if (componentIsMounted.current) {
      setTimeout(doSetTimeout, 5000);
    }
  }

  useEffect(() => {
    doSetTimeout();
    return () => {
      componentIsMounted.current = false
    }
    // NB: This is a valid use case
    // eslint-disable-next-line
  }, []) // NB: Empty array dependency sets to run ONLY on mount

  let eventItems : Array<JSX.Element> = [];

  firehoseEvents.forEach(event => {
    let inner = <span />;
    let userLink = <span>Anonymous user</span>;
    let gravatar = <span />;

    if (event.maybe_target_username !== undefined
      && event.maybe_target_username !== null
      && event.maybe_target_user_token !== undefined
      && event.maybe_target_user_token !== null) {
      let link = `/profile/${event.maybe_target_username}`;
      userLink = (
        <Link to={link}>
          {event.maybe_target_display_name}
        </Link>
      );
      gravatar = (
        <Gravatar
          size={15}
          username={event.maybe_target_username} 
          email_hash={event.maybe_target_user_gravatar_hash}
          />
      );
    }

    switch (event.event_type) {
      case 'user_sign_up':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            signed up for FakeYou!
          </span>
        );
        break;
      case 'user_badge_granted':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            got a badge!
          </span>
        );
        break;
      case 'tts_model_upload_started':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            started TTS model upload
          </span>
        );
        break;
      case 'tts_model_upload_completed':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            completed TTS model upload
          </span>
        );
        break;
      case 'tts_inference_started':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            started TTS
          </span>
        );
        break;
      case 'tts_inference_completed':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            completed TTS
          </span>
        );
        break;
      case 'w2l_template_upload_started':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            started uploading a lipsync template.
          </span>
        );
        break;
      case 'w2l_template_upload_completed':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            finished uploading a lipsync template.
          </span>
        );
        break;
      case 'w2l_inference_started':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            started a W2L lipsync video
          </span>
        );
        break;
      case 'w2l_inference_completed':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            completed a W2L lipsync video
          </span>
        );
        break;
      case 'twitter_mention':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            mentioned us on twitter!
          </span>
        );
        break;
      case 'twitter_retweet':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            retweeted us!
          </span>
        );
        break;
      case 'discord_join':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            joined discord!
          </span>
        );
        break;
      case 'discord_message':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            sent a discord message
          </span>
        );
        break;
      case 'twitch_subscribe':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            subscribed to us on twitch!
          </span>
        );
        break;
      case 'twitch_follow':
        inner = (
          <span>
            {gravatar}
            &nbsp;
            {userLink}
            &nbsp;
            followed us on twitch!
          </span>
        );
        break;
      default:
        return;
    }

    eventItems.push((
      <li key={event.event_token}>{inner}</li>
    ));
  });


  return (
    <div>
      <h1 className="title is-1"> Firehose event feed </h1>
      <h1 className="subtitle is-3"> The latest <em>FakeYou</em> events refreshed every few seconds</h1>

      <div className="content is-large">
        <p>As you can see, we're <em>really</em> popular. But we owe it to you, our users. Thank you!</p>
        <ul>
          {eventItems}
        </ul>
      </div>

    </div>
  )
}

export { FirehoseEventListFc };
