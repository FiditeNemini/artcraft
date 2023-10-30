import React from "react";
import { faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { VoiceDetails } from "./components/steps/VoiceDetails";

function VoiceDesignerVoiceEditPage() {
  usePrefixedDocumentTitle("Edit Voice");

  return (
    <Container type="panel">
      <PageHeader
        title="Edit Voice"
        titleIcon={faWaveform}
        subText="Make changes to your voice details"
        buttonTo="/voice-designer/create"
        panel={false}
        showBackButton={true}
        backbuttonLabel="Back to Voice Designer"
        backbuttonTo="/voice-designer"
      />

      <Panel padding={true}>
        <VoiceDetails view="voice" />
      </Panel>
    </Container>
  );
}

export { VoiceDesignerVoiceEditPage };
