import React from "react";
import { Widget } from "@typeform/embed-react";
import { get, set } from "local-storage";
import "./TypeformContainer.scss";

interface TypeformWidgetProps {
  formId: string;
}

export default function TypeformWidget({ formId }: TypeformWidgetProps) {
  return (
    <>
      {!get<boolean>("isSubmit") ? (
        <div className="typeformcontainer">
          <Widget
            id={formId}
            style={{ width: "100%", height: "100%" }}
            opacity={80}
            onSubmit={() => {
              set<boolean>("isSubmit", true);
              console.log("Form submitted!");
            }}
            hideHeaders
            enableSandbox={false}
          />
        </div>
      ) : null}
    </>
  );
}
