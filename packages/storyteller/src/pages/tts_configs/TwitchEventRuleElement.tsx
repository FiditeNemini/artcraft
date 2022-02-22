import React from 'react';
import { TwitchEventRule } from '@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

interface Props {
  rule: TwitchEventRule,
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
    description = (
      <>
        TTS with voice: {props.rule.event_response.tts_single_voice.tts_model_token}
      </>
    );
  } else if (props.rule.event_response.tts_random_voice !== undefined) {
    description = (
      <>
        TTS with a random voice from: {props.rule.event_response.tts_random_voice.tts_model_tokens}
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
          <p className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowUp} />&nbsp;Up
            </span>
          </p>
          <p className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowDown} />&nbsp;Down
            </span>
          </p>
          <p className="card-footer-item">
            <span>
              <Link to={editUrl}>
                <FontAwesomeIcon icon={faEdit} />&nbsp;Edit
              </Link>
            </span>
          </p>
          <p className="card-footer-item">
            <span>
              <Link to={deleteUrl}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </Link>
            </span>
          </p>
        </footer>
      </>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="card-content">
          <p className="title is-5">
            {subtitle}
          </p>
          <p>
            {description}
          </p>
        </div>
        {buttons}
      </div>
      <br />
    </div>
  )
}

export { TwitchEventRuleElement }