import React, { useContext } from "react";
import { Panel } from "..";
import { AdBanner } from "./AdBanner";
import { SessionContext } from "context";

export function AdHorizontal() {
  const { user, sessionSubscriptions } = useContext(SessionContext);

  if (user && sessionSubscriptions?.hasPaidFeatures()) {
    return null;
  }

  return (
    <Panel
      clear={true}
      className="d-flex align-items-center justify-content-center"
    >
      <AdBanner
        dataAdSlot="7558376102"
        dataAdFormat="horizontal"
        dataFullWidthResponsive={true}
      />
    </Panel>
  );
}
