import React from "react";
import { Widget } from "@typeform/embed-react";
import { useLocation } from "react-router-dom";
import { useDomainConfig } from "context/DomainConfigContext";

export const BetaLipSyncForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");
  const domain = useDomainConfig();

  const formId = "ETlmLSEx";

  const fullFormUrl = `${formId}?${
    domain.titlePart === "FakeYou"
      ? "typeform-source=fakeyou.com"
      : "typeform-source=storyteller.ai"
  }&email=${encodeURIComponent(email || "")}`;

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Widget id={fullFormUrl} className="h-100" />
    </div>
  );
};
