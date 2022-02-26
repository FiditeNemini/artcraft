import React from 'react';
import { TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faEdit, faExternalLinkAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';

interface Props {
  rule: TwitchEventRule,
  allTtsModelsByToken: Map<string, TtsModelListItem>,
  hideButtons?: boolean,
}

function TwitchEventRuleElement(props: Props) {
  const hideButtons = !!props.hideButtons;

  let title = "Not Set";
  let subtitle = <></>;
  let description = <></>;

  if (props.rule.event_match_predicate.bits_cheermote_name_exact_match !== undefined) {
    title = "Cheermote Name Matches"
    subtitle = (
      <>Cheermote name matches "{props.rule.event_match_predicate.bits_cheermote_name_exact_match.cheermote_name}"</>
    );
  } else if (props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold !== undefined) {
    title = "Cheermote Prefix Matches and Spend Threshold"
    subtitle = (
      <>
        Cheermote prefix is "{props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold.cheermote_prefix}"
        and spend at least {props.rule.event_match_predicate.bits_cheermote_prefix_spend_threshold.minimum_bits_spent} bits
      </>
    );
  } else if (props.rule.event_match_predicate.bits_spend_threshold !== undefined) {
    title = "Spend Threshold"
    subtitle = (
      <>
        Spend at least {props.rule.event_match_predicate.bits_spend_threshold.minimum_bits_spent} bits
      </>
    );
  } else if (props.rule.event_match_predicate.channel_points_reward_name_exact_match !== undefined) {
    title = "Channel Points Reward Name Match"
    subtitle = (
      <>
        Reward name matches "{props.rule.event_match_predicate.channel_points_reward_name_exact_match.reward_name}"
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
        TTS with voice: {modelName} <a href={link} target="_blank"><FontAwesomeIcon icon={faExternalLinkAlt} /></a>
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
          {modelName} <a href={link} target="_blank"><FontAwesomeIcon icon={faExternalLinkAlt} /></a>
        </li>
      );
    });

    description = (
      <>
        TTS with a random voice from the following {modelNameAndLinks.length} voice(s): 
        <ul>{modelNameAndLinks}</ul>
      </>
    );
  }

  const editUrl = `/tts_configs/edit/${props.rule.token}`;
  const deleteUrl = `/tts_configs/delete/${props.rule.token}`;

  let buttons = <></>;
  if (!hideButtons) {
    buttons = (
      <>
        <footer className="card-footer">
          <div className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowUp} />&nbsp;Up
            </span>
          </div>
          <div className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowDown} />&nbsp;Down
            </span>
          </div>
          <div className="card-footer-item">
            <span>
              <Link to={editUrl}>
                <FontAwesomeIcon icon={faEdit} />&nbsp;Edit
              </Link>
            </span>
          </div>
          <div className="card-footer-item">
            <span>
              <Link to={deleteUrl}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </Link>
            </span>
          </div>
        </footer>
      </>
    )
  }

  return (
    <div key={props.rule.token}>
      <div className="card">
        <div className="card-content">
          <div className="title is-5">
            {subtitle}
          </div>
          <div>
            {description}
          </div>
        </div>
        {buttons}
      </div>
      <br />
    </div>
  )
}

export { TwitchEventRuleElement }