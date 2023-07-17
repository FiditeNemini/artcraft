import React from "react";
import { faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { PageHeaderWithImage } from "v2/view/_common/PageHeaderWithImage";
import { Panel } from "v2/view/_common/Panel";
import { Stepper } from "./components/Stepper";
import { StepperControls } from "./components/StepperControls";

function VoiceDesignerPage(this: any) {
  usePrefixedDocumentTitle("Voice Designer");

  return (
    <div>
      <PageHeaderWithImage
        headerImage="/mascot/kitsune_pose2.webp"
        titleIcon={<FontAwesomeIcon icon={faWaveform} className="me-3" />}
        title={<>Voice Designer</>}
        subText={
          <>
            Clone your own voice or a voice you have permission and rights to!
          </>
        }
        showButtons={false}
      />

      <Panel>
        <Stepper />
        <StepperControls />
      </Panel>
    </div>
  );
}

export { VoiceDesignerPage };
