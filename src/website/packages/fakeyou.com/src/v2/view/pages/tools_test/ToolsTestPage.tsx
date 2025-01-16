import { Container, Panel } from "components/common";
import AdBanner from "components/common/AdBanner/AdBanner";
import React from "react";

export default function ToolsTestPage() {
  return (
    <Container type="panel" className="mt-5">
      <Panel clear={true}>
        <AdBanner
          dataAdSlot="7558376102"
          dataAdFormat="auto"
          dataFullWidthResponsive={true}
        />
      </Panel>
    </Container>
  );
}
