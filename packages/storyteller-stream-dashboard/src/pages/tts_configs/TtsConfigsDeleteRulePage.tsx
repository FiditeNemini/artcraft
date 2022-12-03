import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  GetTwitchEventRule,
  GetTwitchEventRuleIsError,
  GetTwitchEventRuleIsOk,
  TwitchEventRule,
} from "@storyteller/components/src/api/storyteller/twitch_event_rules/GetTwitchEventRule";
import { DeleteTwitchEventRule } from "@storyteller/components/src/api/storyteller/twitch_event_rules/DeleteTwitchEventRule";
import { TwitchEventRuleElement } from "./rule_cards/TwitchEventRuleElement";
import { Link, useHistory, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { MustBeLoggedInView } from "../../layout/MustBeLoggedInView";

interface Props {
  sessionWrapper: SessionWrapper;
  allTtsModelsByToken: Map<string, TtsModelListItem>;
}

function TtsConfigsDeleteRulePage(props: Props) {
  const { token }: { token: string } = useParams();

  const history = useHistory();

  const [twitchEventRule, setTwitchEventRule] = useState<
    TwitchEventRule | undefined
  >(undefined);

  const getTwitchEventRule = useCallback(async (token: string) => {
    const response = await GetTwitchEventRule(token);

    if (GetTwitchEventRuleIsOk(response)) {
      setTwitchEventRule(response.twitch_event_rule);
    } else if (GetTwitchEventRuleIsError(response)) {
      // TODO
    }
  }, []);

  useEffect(() => {
    getTwitchEventRule(token);
  }, [getTwitchEventRule, token]);

  const indexLink = "/tts_configs";

  const handleDeleteFormSubmit = async (
    ev: React.FormEvent<HTMLFormElement>
  ): Promise<boolean> => {
    ev.preventDefault();

    const result = await DeleteTwitchEventRule(token);
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

  if (twitchEventRule === undefined) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <div className="pt-5 container pb-2">
        <h1 className="fw-bold mt-5 pt-lg-5">
          <span className="word">Delete Rule?</span>
        </h1>
      </div>

      <div className="container pt-5">
        <TwitchEventRuleElement
          rule={twitchEventRule}
          hideButtons={true}
          allTtsModelsByToken={props.allTtsModelsByToken}
        />
      </div>

      <div className="container mt-3">
        <form onSubmit={handleDeleteFormSubmit}>
          <button className="btn btn-primary w-100">
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Delete
          </button>
        </form>

        <Link to={indexLink} className="btn btn-secondary mt-3 mb-5">
          <FontAwesomeIcon icon={faAngleLeft} />
          &nbsp;Cancel / Go Back
        </Link>
      </div>
    </>
  );
}

export { TtsConfigsDeleteRulePage };
