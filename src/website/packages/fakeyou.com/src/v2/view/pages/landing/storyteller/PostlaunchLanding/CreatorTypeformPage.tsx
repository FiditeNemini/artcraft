import React from "react";
import { Widget } from "@typeform/embed-react";
import { useLocation } from "react-router-dom";
import { useDomainConfig } from "context/DomainConfigContext";
import { set } from "local-storage";

export const CreatorTypeformPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");
  const domain = useDomainConfig();

  const formId = "ZQTkv9ha";

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
      <Widget
        onSubmit={() => {
          set<boolean>("secondFormIsSubmitted", true);
        }}
        id={fullFormUrl}
        className="h-100"
      />
    </div>
  );
};
