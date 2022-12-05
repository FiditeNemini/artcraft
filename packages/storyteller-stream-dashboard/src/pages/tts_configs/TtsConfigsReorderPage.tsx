import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  ListTwitchEventRules,
  ListTwitchEventRulesIsError,
  ListTwitchEventRulesIsOk,
  TwitchEventRule,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/ListTwitchEventRules";
import {
  ReorderTwitchEventRules,
  ReorderTwitchEventRulesRequest,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/ReorderTwitchEventRules";
import {
  TwitchEventCategory,
  TWITCH_EVENT_CATEGORY_BY_STRING,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/shared/TwitchEventCategory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { useHistory, useParams } from "react-router-dom";
import { ReorderableTwitchEventRuleElement } from "./rule_cards/ReorderableTwitchEventRuleElement";
import { MustBeLoggedInView } from "../../layout/MustBeLoggedInView";

interface Props {
  sessionWrapper: SessionWrapper;
  allTtsModelsByToken: Map<string, TtsModelListItem>;
}

function TtsConfigsReorderPage(props: Props) {
  const { event_category } = useParams() as { event_category: string };

  const history = useHistory();

  // TODO: Use centralized configs
  const indexLink = "/tts_configs";

  const [twitchEventRules, setTwitchEventRules] = useState<TwitchEventRule[]>(
    []
  );

  const listTwitchEventRules = useCallback(
    async (twitchEventCategory: TwitchEventCategory) => {
      const response = await ListTwitchEventRules();

      if (ListTwitchEventRulesIsOk(response)) {
        const allRules = response.twitch_event_rules;
        const releventRules = allRules.filter(
          (rule) => rule.event_category === twitchEventCategory
        );

        setTwitchEventRules(releventRules);
      } else if (ListTwitchEventRulesIsError(response)) {
        // TODO
      }
    },
    []
  );

  useEffect(() => {
    console.log("useEffect");
    let maybeTwitchEventCategory =
      TWITCH_EVENT_CATEGORY_BY_STRING.get(event_category);

    if (maybeTwitchEventCategory === undefined) {
      history.push(indexLink);
    } else {
      listTwitchEventRules(maybeTwitchEventCategory);
    }
  }, [listTwitchEventRules, event_category, history]);

  const handleMoveUp = (ruleIndex: number) => {
    let newEventRules = [...twitchEventRules];

    if (
      ruleIndex >= newEventRules.length || // Walk off end
      ruleIndex === 0
    ) {
      // Can't move up.
      return false;
    }

    let aboveIndex = ruleIndex - 1;
    let aboveRule = newEventRules[aboveIndex];

    newEventRules[aboveIndex] = newEventRules[ruleIndex];
    newEventRules[ruleIndex] = aboveRule;

    setTwitchEventRules(newEventRules);
  };

  const handleMoveDown = (ruleIndex: number) => {
    let newEventRules = [...twitchEventRules];

    if (
      ruleIndex < 0 || // Invalid
      ruleIndex >= newEventRules.length - 1
    ) {
      // Can't move down.
      return false;
    }

    let belowIndex = ruleIndex + 1;

    console.log(ruleIndex, belowIndex);

    let belowRule = newEventRules[belowIndex];

    newEventRules[belowIndex] = newEventRules[ruleIndex];
    newEventRules[ruleIndex] = belowRule;

    setTwitchEventRules(newEventRules);
  };

  const handleSaveOrderings = async (
    ev: React.FormEvent<HTMLButtonElement>
  ): Promise<boolean> => {
    const pairs = twitchEventRules.map((rule, index) => {
      return {
        rule_token: rule.token,
        position: index,
      };
    });

    const request: ReorderTwitchEventRulesRequest = {
      rule_token_position_pairs: pairs,
    };

    const result = await ReorderTwitchEventRules(request);
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

  return (
    <>
      <div className="container pt-5">
        <h1 className="fw-bold mt-5 pt-lg-5 mb-4">
          <span className="word">Reorder Rules</span>
        </h1>
        <h2 className="fw-bold">
          {" "}
          This affects match priority. Rules at the top come first.{" "}
        </h2>
      </div>

      <div className="container">
        <p className="pb-5">
          You can create rules for matching{" "}
          <em>different categories of events</em>: cheers (bits), channel point
          rewards, etc. When an event occurs in your stream, we compare it
          against the rules in its category.{" "}
          <strong>The first matched rule</strong> (from the top) is selected,
          and the action that it specifies is taken. For now this is limited to
          FakeYou text to speech, but we'll be adding lots of new capabilities
          soon.
        </p>

        {twitchEventRules.map((rule, index) => {
          return (
            <ReorderableTwitchEventRuleElement
              key={rule.token}
              rule={rule}
              ruleIndex={index}
              handleMoveUp={handleMoveUp}
              handleMoveDown={handleMoveDown}
              allTtsModelsByToken={props.allTtsModelsByToken}
            />
          );
        })}

        <button
          className="btn btn-primary w-100 my-5"
          onClick={handleSaveOrderings}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          Save Orderings
        </button>
      </div>
    </>
  );
}

export { TtsConfigsReorderPage };
