import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  ListTwitchEventRules,
  ListTwitchEventRulesIsError,
  ListTwitchEventRulesIsOk,
  TwitchEventRule,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules";
import { TwitchEventRuleElement } from "./rule_cards/TwitchEventRuleElement";
import { TwitchEventCategory } from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faDonate,
  faFilm,
  faGem,
  faHeart,
  faLightbulb,
  faMeteor,
  faPlus,
  faSort,
  faTerminal,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { Link } from "react-router-dom";

interface Props {
  sessionWrapper: SessionWrapper;
  allTtsModelsByToken: Map<string, TtsModelListItem>;
}

function TtsConfigsIndexPage(props: Props) {
  const [twitchEventRules, setTwitchEventRules] = useState<TwitchEventRule[]>(
    []
  );

  const listTwitchEventRules = useCallback(async () => {
    const response = await ListTwitchEventRules();

    if (ListTwitchEventRulesIsOk(response)) {
      setTwitchEventRules(response.twitch_event_rules);
    } else if (ListTwitchEventRulesIsError(response)) {
      // TODO
    }
  }, []);

  useEffect(() => {
    listTwitchEventRules();
  }, [listTwitchEventRules]);

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  const cheerEventRules = twitchEventRules.filter(
    (rule) => rule.event_category === TwitchEventCategory.Bits
  );

  const channelPointsEventRules = twitchEventRules.filter(
    (rule) => rule.event_category === TwitchEventCategory.ChannelPoints
  );

  return (
    <>
      <div className="pt-5 container">
        <h1 className="mt-5 pt-5">
          <span className="word">Stream Setup</span>
        </h1>
        <h3>Configure TTS (and soon much more!)</h3>
        <div className="alert alert-primary mt-4">
          You can create rules for matching different categories of events:
          cheers (bits), channel point rewards, etc. When an event occurs in
          your stream, we compare it against the rules in its category. The
          first matched rule (from the top) is selected, and the action that it
          specifies is taken. For now this is limited to FakeYou text to speech,
          but we'll be adding lots of new capabilities soon.
        </div>
      </div>
      <div className="container pt-5">
        <h2 className="fw-bold">
          <FontAwesomeIcon icon={faGem} className="text-red me-3" />
          Bits / Cheers
        </h2>
        <p className="fs-5">
          These settings are best for small and medium-sized channels.
        </p>
        <div className="d-flex flex-column gap-3 mb-5 mt-4">
          <Link to="/tts_configs/create/bits" className="btn btn-primary w-100">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            &nbsp;Create New Bits / Cheer Rule
          </Link>
          <Link
            to="/tts_configs/reorder/bits"
            className="btn btn-secondary w-100"
          >
            <FontAwesomeIcon icon={faSort} className="me-2" />
            &nbsp;Reorder Rules
          </Link>
        </div>
        {cheerEventRules.map((rule) => {
          return (
            <TwitchEventRuleElement
              key={rule.token}
              rule={rule}
              allTtsModelsByToken={props.allTtsModelsByToken}
            />
          );
        })}
      </div>

      <div className="container">
        <Link
          to="/tts_configs/create/bits"
          className="button is-large is-fullwidth is-primary"
        >
          <FontAwesomeIcon icon={faPlus} />
          &nbsp;Create New Bits / Cheer Rule
        </Link>

        <br />

        <Link
          to="/tts_configs/reorder/bits"
          className="button is-large is-fullwidth is-primary is-outlined"
        >
          <FontAwesomeIcon icon={faSort} />
          &nbsp;Reorder Rules
        </Link>

        <br />
        <br />

        <div className="content">
          <h1 className="title is-3">
            {" "}
            <FontAwesomeIcon icon={faBox} /> Channel Points / Rewards{" "}
          </h1>
          <h2 className="subtitle is-5">
            These settings are best for small channels.
          </h2>
          {channelPointsEventRules.map((rule) => {
            return (
              <TwitchEventRuleElement
                key={rule.token}
                rule={rule}
                allTtsModelsByToken={props.allTtsModelsByToken}
              />
            );
          })}
        </div>

        <Link
          to="/tts_configs/create/channel_points"
          className="button is-large is-fullwidth is-primary"
        >
          <FontAwesomeIcon icon={faPlus} />
          &nbsp;Create Channel Points Rule
        </Link>

        <br />

        <Link
          to="/tts_configs/reorder/channel_points"
          className="button is-large is-fullwidth is-primary is-outlined"
        >
          <FontAwesomeIcon icon={faSort} />
          &nbsp;Reorder Rules
        </Link>

        <br />
        <br />

        <div className="content">
          <h1 className="title is-1">
            {" "}
            <FontAwesomeIcon icon={faMeteor} /> Coming Soon&hellip;
          </h1>
        </div>
        <br />

        <div className="content">
          <h1 className="title is-4">
            {" "}
            <FontAwesomeIcon icon={faHeart} /> Subs, Resubs, and Gifted Subs{" "}
          </h1>
          <h2 className="subtitle is-6">
            These settings are great for all channel sizes.
          </h2>
        </div>
        <br />

        <div className="content">
          <h1 className="title is-4">
            {" "}
            <FontAwesomeIcon icon={faDonate} /> Donation Services (Streamlabs,
            StreamElements, etc.){" "}
          </h1>
          <h2 className="subtitle is-6">
            These settings are great for large channels, but work for channels
            of all sizes.
          </h2>
        </div>

        <br />

        <div className="content">
          <h1 className="title is-5">
            {" "}
            <FontAwesomeIcon icon={faTerminal} /> Text <code>/slash</code>{" "}
            Commands
          </h1>
          <h2 className="subtitle is-6">
            These settings are great for very small channels.
          </h2>
        </div>

        <br />

        <div className="content">
          <h1 className="title is-4">
            {" "}
            <FontAwesomeIcon icon={faFilm} /> User-generated Animated Deepfake
            Rewards{" "}
          </h1>
          <h2 className="subtitle is-6">
            A lip-synced, green screened <em>&ldquo;Famous Person&rdquo;</em>{" "}
            pops up and says something.
          </h2>
        </div>

        <br />

        <div className="content">
          <h1 className="title is-4">
            {" "}
            <FontAwesomeIcon icon={faUsers} /> Multi Voice and Sound Effects{" "}
          </h1>
          <h2 className="subtitle is-6">
            User-selected voices can be strung together in a single reward,
            interspersed with sound effects.
          </h2>
        </div>

        <br />

        <div className="content">
          <h1 className="title is-2">
            {" "}
            <FontAwesomeIcon icon={faLightbulb} /> Suggestions?{" "}
          </h1>
          <h2 className="subtitle is-4">Let us know what to build!</h2>
          <p>
            Can you think of anything we haven't provided?{" "}
            <DiscordLink
              text="Please let us know in Discord"
              iconAfterText={true}
            />{" "}
            so that we can build it!
          </p>
        </div>
        <br />
        <br />
      </div>
    </>
  );
}

export { TtsConfigsIndexPage };
