import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import PageHeader from 'components/layout/PageHeader';
import { Button, Container, Input, Panel, TextAreaV2 } from "components/common";
import { WebUrl } from "../../../../common/WebUrl";
import {
  ModerationTokenInfo,
} from "@storyteller/components/src/api/moderation/ModerationTokenInfo";
import { faDatabase } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ModerationTokenInfoPage(props: Props) {
  const [token, setToken] = useState<string>("");
  const [payload, setPayload] = useState<string>("");

  const doLookup = async () => {
    let response = await ModerationTokenInfo(token, {});

    if (!!response.maybe_payload) {
      setPayload(response.maybe_payload);
    }
  };

  const onChange = (
    ev: React.FormEvent<HTMLInputElement>
  ) => {
    const value = (ev.target as HTMLInputElement).value.trim();
    setToken(value);
  }

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  let textareaContents = "";

  if (!!payload) {
    textareaContents = JSON.parse(JSON.stringify(payload, null, "\t"));
  }

  return (
    <Container type="panel" className="mb-5">
      <PageHeader {...{
        back: { to: WebUrl.moderationMain(), label: "Back to moderation" },
        title: "Token Entity Lookup",
        subText: "Look up various entities by token"
      }}/>
      <Panel {...{ padding: true }}>

        <Input 
          label="Token"
          icon={faDatabase}
          onChange={onChange}
          value={token}
        />

        <br />
        <br />

        <Button
          label="Do Lookup"
          onClick={doLookup}
        />

        <br />
        <br />

        <TextAreaV2 
          label="Search Result"
          value={textareaContents}
        />

        <pre>{textareaContents}</pre>

      </Panel>
    </Container>
  );
}

export { ModerationTokenInfoPage };
