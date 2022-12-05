import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TwitchEventRule } from "@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  TwitchEventCategory,
  TWITCH_EVENT_CATEGORY_BY_STRING,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory";
import { EventResponse } from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventResponse";
import { EventMatchPredicate } from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/EventMatchPredicate";
import {
  CreateTwitchEventRule,
  CreateTwitchEventRuleRequest,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/CreateTwitchEventRule";
import { EventMatchPredicateBuilderComponent } from "./event_match_predicate_builder/EventMatchPredicateBuilderComponent";
import { EventResponseComponent } from "./event_response_builder/EventResponseComponent";
import { TwitchEventRuleElement } from "./rule_cards/TwitchEventRuleElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { MustBeLoggedInView } from "../../layout/MustBeLoggedInView";

interface Props {
  sessionWrapper: SessionWrapper;
  allTtsModels: TtsModelListItem[];
  allTtsModelsByToken: Map<string, TtsModelListItem>;
}

function TtsConfigsCreateRulePage(props: Props) {
  const { event_category } = useParams() as { event_category: string };

  const history = useHistory();

  // TODO: Use centralized configs
  const indexLink = "/tts_configs";

  // ========== In-Progress Model Edits ==========

  // Sent to sub-components to initialize UI
  // NB: This is a HACK. The subcomponent views were originally created for the "Edit" UI
  // and this had to be done to get them to work for "Create" UI. Sending empty dictionaries
  // or statically initialized values froze the UI.
  const [serverEventMatchPredicate] = useState<EventMatchPredicate>({});
  const [serverEventResponse] = useState<EventResponse>({});

  const [modifiedEventMatchPredicate, setModifiedEventMatchPredicate] =
    useState<EventMatchPredicate>({});
  const [modifiedEventResponse, setModifiedEventResponse] =
    useState<EventResponse>({});
  const [ruleIsDisabled] = useState(false);

  let maybeTwitchEventCategory =
    TWITCH_EVENT_CATEGORY_BY_STRING.get(event_category);

  if (maybeTwitchEventCategory === undefined) {
    history.push(indexLink);
    return <></>;
  }

  // NB: To satisfy the type system and not be a union on 'undefined'
  const twitchEventCategory = maybeTwitchEventCategory;

  const updateModifiedEventMatchPredicate = (
    predicate: EventMatchPredicate
  ) => {
    setModifiedEventMatchPredicate(predicate);
  };

  const updateModifiedEventResponse = (response: EventResponse) => {
    setModifiedEventResponse(response);
  };

  const handleFormSubmit = async (
    ev: React.FormEvent<HTMLFormElement>
  ): Promise<boolean> => {
    ev.preventDefault();

    // TODO: Check for errors.

    let newEventMatchPredicate = modifiedEventMatchPredicate;
    let newEventResponse = modifiedEventResponse;

    // TODO: UUID idempotency token that updates on every model change.

    const request: CreateTwitchEventRuleRequest = {
      idempotency_token: uuidv4(),
      event_category: twitchEventCategory,
      event_match_predicate: newEventMatchPredicate,
      event_response: newEventResponse,
      rule_is_disabled: ruleIsDisabled,
      user_specified_rule_order: 1000,
    };

    const result = await CreateTwitchEventRule(request);
    if (result.success) {
      history.push(indexLink);
    }

    return false;
  };

  if (!props.sessionWrapper.isLoggedIn()) {
    return (
      <>
        <MustBeLoggedInView />
      </>
    );
  }

  // NB: This is a hypothetical version of what we'll update to
  let renderRule: TwitchEventRule = {
    // Not yet saved, so fake values
    token: "virtual",
    user_specified_rule_order: 1000,
    created_at: new Date(),
    updated_at: new Date(),

    // Updated in UI
    event_category: twitchEventCategory,
    event_match_predicate: modifiedEventMatchPredicate,
    event_response: modifiedEventResponse,
    rule_is_disabled: ruleIsDisabled,
  };

  const titlesByCategory = new Map<TwitchEventCategory, string>([
    [TwitchEventCategory.Bits, "Create New Bits Rule"],
    [TwitchEventCategory.ChannelPoints, "Create New Channel Points Rule"],
  ]);

  const pageTitle = titlesByCategory.get(twitchEventCategory);

  return (
    <>
      <div className="pt-5 container pb-2">
        <h1 className="fw-bold mt-5 pt-lg-5">
          <span className="word">{pageTitle}</span>
        </h1>
      </div>

      <div className="container mt-5">
        <form onSubmit={handleFormSubmit} className="d-flex flex-column gap-4">
          <EventMatchPredicateBuilderComponent
            twitchEventCategory={twitchEventCategory}
            serverEventMatchPredicate={serverEventMatchPredicate}
            updateModifiedEventMatchPredicate={
              updateModifiedEventMatchPredicate
            }
          />

          <EventResponseComponent
            serverEventResponse={serverEventResponse}
            updateModifiedEventResponse={updateModifiedEventResponse}
            allTtsModels={props.allTtsModels}
            allTtsModelsByToken={props.allTtsModelsByToken}
          />

          <h2 className="fw-bold mt-4">This is the rule:</h2>

          <TwitchEventRuleElement
            rule={renderRule}
            hideButtons={true}
            allTtsModelsByToken={props.allTtsModelsByToken}
          />
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save New Rule
          </button>
        </form>

        <Link to={indexLink} className="btn btn-secondary mt-3 mb-5">
          <FontAwesomeIcon icon={faAngleLeft} className="me-2" />
          Cancel / Go Back
        </Link>
      </div>
    </>
  );
}

export { TtsConfigsCreateRulePage };
