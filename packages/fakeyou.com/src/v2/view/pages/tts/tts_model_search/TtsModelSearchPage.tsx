import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container";
import Panel from "components/common/Panel/Panel";

interface TtsModelSearchPageProps {
  sessionWrapper: SessionWrapper;
}

export default function TtsModelSearchPage(props: TtsModelSearchPageProps) {
  return (
    <Container type="panel">
      <Panel padding={true}>
        <div>test</div>
      </Panel>
    </Container>
  );
}
