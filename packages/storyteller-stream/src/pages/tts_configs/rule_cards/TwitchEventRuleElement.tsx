import React from "react";
import { TwitchEventRule } from "@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExternalLinkAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";

interface Props {
  rule: TwitchEventRule;
  allTtsModelsByToken: Map<string, TtsModelListItem>;
  hideButtons?: boolean;
}

function TwitchEventRuleElement(props: Props) {
  const hideButtons = !!props.hideButtons;

  let subtitle = <></>;
  let description = <></>;

  if (
    props.rule.event_match_predicate.bits_cheermote_name_exact_match !==
    undefined
  ) {
    subtitle = (
      <>
        Cheermote name matches "
        {
          props.rule.event_match_predicate.bits_cheermote_name_exact_match
            .cheermote_name
        }
        "
      </>
    );
  } else if (
    props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold !==
    undefined
  ) {
    subtitle = (
      <>
        Cheermote prefix is "
        {
          props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold
            .cheermote_prefix
        }
        " and spend at least{" "}
        {
          props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold
            .minimum_bits_spent
        }{" "}
        bits
      </>
    );
  } else if (
    props.rule.event_match_predicate.bits_spend_threshold !== undefined
  ) {
    subtitle = (
      <>
        Spend at least{" "}
        {
          props.rule.event_match_predicate.bits_spend_threshold
            .minimum_bits_spent
        }{" "}
        bits
      </>
    );
  } else if (
    props.rule.event_match_predicate.channel_points_reward_name_exact_match !==
    undefined
  ) {
    subtitle = (
      <>
        Reward name matches "
        {
          props.rule.event_match_predicate
            .channel_points_reward_name_exact_match.reward_name
        }
        "
      </>
    );
  }

  if (props.rule.event_response.tts_single_voice !== undefined) {
    const token = props.rule.event_response.tts_single_voice.tts_model_token;

    let model = props.allTtsModelsByToken.get(token);
    let modelName = token;

    if (!!model) {
      modelName = model.title;
    }

    let link = `https://fakeyou.com/tts/${token}`;

    description = (
      <>
        <p>
          TTS with voice:
          <br />
          {modelName}{" "}
          <a href={link} target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-1" />
          </a>
        </p>
      </>
    );
  } else if (props.rule.event_response.tts_random_voice !== undefined) {
    const tokens = props.rule.event_response.tts_random_voice.tts_model_tokens;

    let modelNameAndLinks = tokens.map((token, index) => {
      let model = props.allTtsModelsByToken.get(token);
      let link = `https://fakeyou.com/tts/${token}`;

      let modelName = token;
      if (!!model) {
        modelName = model.title;
      }

      return (
        <li key={index}>
          {modelName}{" "}
          <a href={link} target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-1" />
          </a>
        </li>
      );
    });

    description = (
      <>
        <p>
          TTS with a random voice from the following {modelNameAndLinks.length}{" "}
          voice(s):
          <ul>{modelNameAndLinks}</ul>
        </p>
      </>
    );
  }

  const editUrl = `/tts_configs/edit/${props.rule.token}`;
  const deleteUrl = `/tts_configs/delete/${props.rule.token}`;

  let buttons = <></>;
  if (!hideButtons) {
    buttons = (
      <>
        <div className="d-flex gap-3">
          <Link to={editUrl} className="btn btn-secondary w-100">
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Edit
          </Link>
          <Link to={deleteUrl} className="btn btn-destructive w-100">
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Delete
          </Link>
        </div>
      </>
    );
  }

  return (
    <div key={props.rule.token}>
      <div className="panel p-4">
        <div>
          <h4 className="fw-bold mb-4">{subtitle}</h4>
          <div className="mb-4">{description}</div>
        </div>
        {buttons}
      </div>
      <br />
    </div>
  );
}

export { TwitchEventRuleElement };
